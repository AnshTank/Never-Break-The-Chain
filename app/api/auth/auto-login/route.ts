import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { generateTokens } from '@/lib/jwt'
import { ObjectId } from 'mongodb'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { deviceId } = await request.json()
    
    if (!deviceId) {
      return NextResponse.json({ error: 'Device ID required' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    
    // Find active device with remember me enabled
    const device = await db.collection('devices').findOne({
      deviceId,
      isActive: true,
      rememberMe: true,
      rememberMeExpiry: { $gt: new Date() }
    })
    
    if (!device) {
      return NextResponse.json({ error: 'Device not found or remember me expired' }, { status: 401 })
    }

    // Get user data
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(device.userId) },
      { projection: { email: 1, isNewUser: 1, needsPasswordSetup: 1, password: 1 } }
    )
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    // Generate new tokens with remember me enabled
    const { accessToken, refreshToken, accessTokenMaxAge, refreshTokenMaxAge } = generateTokens({
      userId: user.email,
      email: user.email
    }, true) // Always true for auto-login

    // Update device last active
    await db.collection('devices').updateOne(
      { deviceId },
      { $set: { lastActive: new Date(), lastLogin: new Date() } }
    )

    // Create response with tokens
    const response = NextResponse.json({ 
      message: 'Auto-login successful',
      redirect: user.isNewUser || user.needsPasswordSetup || !user.password ? '/welcome' : '/dashboard'
    })

    // Set secure cookies
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
    console.error('Auto-login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}