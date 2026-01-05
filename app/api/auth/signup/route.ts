import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectToDatabase } from '@/lib/mongodb'
import { generateTokens } from '@/lib/jwt'

export const runtime = 'nodejs'

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
    console.error('Validation error:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Signup API called')
    
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }
    
    console.log('Request body:', body)
    const { email, name } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Validate and sanitize inputs to prevent NoSQL injection
    const sanitizedInputs = validateAndSanitizeEmailOnly(email, name)
    if (!sanitizedInputs) {
      console.warn('Input validation failed:', { email, name, timestamp: new Date().toISOString() })
      return NextResponse.json({ 
        error: 'Invalid email format' 
      }, { status: 400 })
    }

    console.log('Connecting to database...')
    const { db } = await connectToDatabase()
    const users = db.collection('users')

    // Check if user already exists with sanitized email
    const existingUser = await users.findOne({ email: sanitizedInputs.email })
    if (existingUser) {
      console.warn('Signup attempt with existing email:', { email: sanitizedInputs.email, timestamp: new Date().toISOString() })
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }

    console.log('Creating user...')
    // Create user with empty password (will be set during welcome)
    const result = await users.insertOne({
      email: sanitizedInputs.email,
      name: sanitizedInputs.name,
      password: "", // Empty password - user can't login until set
      isNewUser: true,
      needsPasswordSetup: true,
      createdAt: new Date(),
    })

    console.log('User created, generating tokens...')
    // Generate tokens for immediate login
    const { accessToken, refreshToken, accessTokenMaxAge, refreshTokenMaxAge } = generateTokens({
      userId: result.insertedId.toString(),
      email: sanitizedInputs.email
    })

    console.log('Signup: Generated tokens for user:', { userId: result.insertedId.toString(), email: sanitizedInputs.email })

    // Create response with tokens for automatic login
    const response = NextResponse.json({ 
      message: 'Account created successfully! Redirecting to onboarding...',
      email: sanitizedInputs.email,
      redirect: '/welcome'
    }, { status: 201 })

    // Set secure HTTP-only cookies for automatic login
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

    console.log('Signup successful, returning response')
    return response

  } catch (error) {
    // Secure logging - don't expose full error details
    console.error('Signup error occurred at:', new Date().toISOString(), error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}