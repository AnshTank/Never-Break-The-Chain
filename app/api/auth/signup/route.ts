import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectToDatabase } from '@/lib/mongodb'
import { generateTokens } from '@/lib/jwt'
import { checkRateLimit } from '@/lib/rate-limit'
import { validateRequest, signupSchema } from '@/lib/validation'

export const runtime = 'nodejs'

// Get client IP address
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  return 'unknown';
}

// Input validation and sanitization for email-only signup
function validateAndSanitizeEmailOnly(email: any, name: any): { email: string; name: string } | null {
  try {
    // Ensure email is string to prevent NoSQL injection
    if (typeof email !== 'string') {
      return null
    }
    
    // Ensure name is string or null/undefined to prevent NoSQL injection
    if (name !== null && name !== undefined && typeof name !== 'string') {
      return null
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return null
    }
    
    // Sanitize inputs
    return {
      email: email.trim().toLowerCase(),
      name: (typeof name === 'string' && name.trim()) ? name.trim() : email.split('@')[0]
    }
  } catch (error) {
    // console.error('Validation error:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }
    
    // Input validation with Zod
    const validation = validateRequest(signupSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    
    const { email, name } = validation.data;
    const sanitizedEmail = email.toLowerCase().trim();
    const sanitizedName = name || email.split('@')[0];

    // Rate limiting check for signup attempts
    const rateLimitResult = checkRateLimit(`signup:${clientIP}:${sanitizedEmail}`);
    if (!rateLimitResult.allowed) {
      const resetTime = rateLimitResult.resetTime ? new Date(rateLimitResult.resetTime).toISOString() : undefined;
      return NextResponse.json({ 
        error: 'Too many signup attempts. Please try again later.',
        resetTime,
        remainingAttempts: 0
      }, { status: 429 });
    }

    // console.log('Connecting to database...')
    const { db } = await connectToDatabase()
    const users = db.collection('users')

    // Check if user already exists with sanitized email
    const existingUser = await users.findOne({ email: sanitizedEmail })
    if (existingUser) {
      // Check if user has completed setup
      if (existingUser.password && !existingUser.needsPasswordSetup) {
        return NextResponse.json({ 
          error: 'An account with this email already exists. Please sign in instead.',
          userExists: true 
        }, { status: 400 })
      } else {
        // User exists but hasn't verified email - send OTP automatically
        const { generateOTP, sendOTPEmail } = await import('@/lib/email-service');
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
        
        // Update user with new OTP
        await users.updateOne(
          { email: sanitizedEmail },
          { 
            $set: { 
              otpCode: otp, 
              otpExpires: otpExpiry,
              name: sanitizedName // Update name if provided
            } 
          }
        );
        
        // Send OTP email
        const emailSent = await sendOTPEmail(sanitizedEmail, otp, 'verification');
        
        if (emailSent) {
          return NextResponse.json({ 
            message: 'Please verify your email to continue.',
            email: sanitizedEmail,
            needsVerification: true
          }, { status: 201 })
        } else {
          return NextResponse.json({ 
            error: 'Unable to send verification email at the moment. Please check your internet connection and try again. If the problem persists, contact support.',
            emailFailed: true
          }, { status: 503 })
        }
      }
    }

    // Create user without email verification initially
    const { generateOTP, sendOTPEmail } = await import('@/lib/email-service');
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    
    const result = await users.insertOne({
      email: sanitizedEmail,
      name: sanitizedName,
      password: "", // Empty password - user can't login until set
      emailVerified: false, // Require email verification
      isNewUser: true,
      needsPasswordSetup: true,
      otpCode: otp,
      otpExpires: otpExpiry,
      createdAt: new Date(),
    })

    // Send OTP email
    const emailSent = await sendOTPEmail(sanitizedEmail, otp, 'verification');
    
    if (emailSent) {
      return NextResponse.json({ 
        message: 'Account created! Please verify your email to continue.',
        email: sanitizedEmail,
        needsVerification: true
      }, { status: 201 })
    } else {
      // Delete the user if email failed to send
      await users.deleteOne({ email: sanitizedEmail });
      
      return NextResponse.json({ 
        error: 'Unable to send verification email at the moment. Please check your internet connection and try again. If the problem persists, contact support.',
        emailFailed: true
      }, { status: 503 })
    }

  } catch (error) {
    // Secure logging - don't expose full error details
    // console.error('Signup error occurred at:', new Date().toISOString(), error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}