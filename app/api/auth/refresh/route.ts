import { NextRequest, NextResponse } from 'next/server'
import { verifyRefreshToken, generateTokens } from '@/lib/jwt'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refresh-token')?.value
    
    if (!refreshToken) {
      return NextResponse.json({ error: 'Refresh token required' }, { status: 401 })
    }
    
    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken)
    if (!payload) {
      const response = NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 })
      response.cookies.delete('auth-token')
      response.cookies.delete('refresh-token')
      return response
    }
    
    // Detect remember me setting from refresh token expiration
    const isLongLived = payload.exp && payload.iat && (payload.exp - payload.iat) > (100 * 24 * 60 * 60) // More than 100 days means remember me was used
    
    // Generate new tokens with remember me setting preserved
    const { accessToken, refreshToken: newRefreshToken, accessTokenMaxAge, refreshTokenMaxAge } = generateTokens({
      userId: payload.userId,
      email: payload.email
    }, Boolean(isLongLived))
    
    const response = NextResponse.json({ 
      message: 'Tokens refreshed successfully' 
    }, { status: 200 })
    
    // Set new secure cookies with dynamic expiration
    response.cookies.set('auth-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: accessTokenMaxAge,
      path: '/'
    })
    
    response.cookies.set('refresh-token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: refreshTokenMaxAge,
      path: '/'
    })
    
    return response
    
  } catch (error) {
    // console.error('Token refresh error occurred at:', new Date().toISOString())
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}