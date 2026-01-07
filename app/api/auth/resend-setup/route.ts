import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { generateTokens } from '@/lib/jwt'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const users = db.collection('users')

    // Find user with incomplete setup
    const user = await users.findOne({ 
      email: email.trim().toLowerCase(),
      needsPasswordSetup: true 
    })

    if (!user) {
      return NextResponse.json({ 
        error: 'No incomplete account found with this email' 
      }, { status: 404 })
    }

    // Generate tokens for setup continuation
    const { accessToken, refreshToken, accessTokenMaxAge, refreshTokenMaxAge } = generateTokens({
      userId: user._id.toString(),
      email: user.email
    })

    // Create response with tokens for automatic login to welcome flow
    const response = NextResponse.json({ 
      message: 'Setup link generated. Redirecting to complete setup...',
      email: user.email,
      redirect: '/welcome'
    }, { status: 200 })

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

    return response

  } catch (error) {
    // console.error('Resend setup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}