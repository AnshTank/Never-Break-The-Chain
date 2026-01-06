import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectToDatabase } from '@/lib/mongodb'
import { generateTokens } from '@/lib/jwt'

export const runtime = 'nodejs'

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
    const body = await request.json()
    const { email, password, rememberMe } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Validate and sanitize inputs to prevent NoSQL injection
    const sanitizedEmail = email.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(sanitizedEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
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
    console.error('Login error occurred at:', new Date().toISOString())
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}