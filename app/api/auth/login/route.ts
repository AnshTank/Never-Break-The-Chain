import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectToDatabase } from '@/lib/mongodb'
import { generateTokens } from '@/lib/jwt'
import { checkRateLimit } from '@/lib/rate-limit'
import { validateRequest, loginSchema } from '@/lib/validation'

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

// Input validation and sanitization
function validateAndSanitizeInput(email: any, password: any): { email: string; password: string } | null {
  // Ensure inputs are strings to prevent NoSQL injection
  if (typeof email !== 'string' || typeof password !== 'string') {
    return null
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return null
  }
  
  // Sanitize inputs (trim whitespace)
  return {
    email: email.trim().toLowerCase(),
    password: password
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const body = await request.json()
    
    // Input validation with Zod
    const validation = validateRequest(loginSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    
    const { email, password, rememberMe } = validation.data;
    const sanitizedEmail = email.toLowerCase().trim();

    // Rate limiting check
    const rateLimitResult = checkRateLimit(`login:${clientIP}:${sanitizedEmail}`);
    if (!rateLimitResult.allowed) {
      const resetTime = rateLimitResult.resetTime ? new Date(rateLimitResult.resetTime).toISOString() : undefined;
      return NextResponse.json({ 
        error: 'Too many login attempts. Please try again later.',
        resetTime,
        remainingAttempts: 0
      }, { status: 429 });
    }

    const { db } = await connectToDatabase()
    const users = db.collection('users')

    // Find user with sanitized email
    const user = await users.findOne({ email: sanitizedEmail })
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Check if user has password set (skip for OAuth users)
    if (!user.password || user.needsPasswordSetup) {
      // Allow OAuth users to login without password if they have oauthProvider
      if (!user.oauthProvider) {
        // Check if email is verified
        if (!user.emailVerified) {
          // Send OTP for email verification
          const { generateOTP, sendOTPEmail } = await import('@/lib/email-service');
          const otp = generateOTP();
          const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
          
          // Update user with new OTP
          await users.updateOne(
            { email: sanitizedEmail },
            { $set: { otpCode: otp, otpExpires: otpExpiry } }
          );
          
          // Send OTP email
          const emailSent = await sendOTPEmail(sanitizedEmail, otp, 'verification');
          
          if (emailSent) {
            return NextResponse.json({ 
              message: 'Please verify your email to continue.',
              email: sanitizedEmail,
              needsVerification: true
            }, { status: 200 })
          } else {
            return NextResponse.json({ 
              error: 'Email service temporarily unavailable. This might be due to network issues or rate limiting. Please try again in a few minutes or contact support.',
              emailFailed: true
            }, { status: 503 })
          }
        }
        
        return NextResponse.json({ 
          error: 'Account setup incomplete. Please check your email for setup instructions.',
          needsPasswordSetup: true,
          email: user.email
        }, { status: 400 })
      }
    }

    // Only validate password if user has one and it's provided
    if (user.password && password && !user.oauthProvider) {
      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      }
    }

    // Generate secure JWT tokens with Remember Me consideration
    const { accessToken, refreshToken, accessTokenMaxAge, refreshTokenMaxAge } = generateTokens({
      userId: user._id.toString(),
      email: user.email
    }, rememberMe)

    // Create secure response with HTTP-only cookies
    const response = NextResponse.json({ 
      message: 'Login successful',
      email: user.email
    }, { status: 200 })

    // Set secure HTTP-only cookies with dynamic expiration
    response.cookies.set('auth-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: accessTokenMaxAge,
      path: '/'
    })

    response.cookies.set('refresh-token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: refreshTokenMaxAge,
      path: '/'
    })

    return response

  } catch (error) {
    // Secure logging - don't expose full error details
    // console.error('Login error occurred at:', new Date().toISOString())
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}