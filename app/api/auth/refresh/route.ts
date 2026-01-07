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
    
    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens({
      userId: payload.userId,
      email: payload.email
    })
    
    const response = NextResponse.json({ 
      message: 'Tokens refreshed successfully' 
    }, { status: 200 })
    
    // Set new secure cookies
    response.cookies.set('auth-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    })
    
    response.cookies.set('refresh-token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 90 * 24 * 60 * 60, // 90 days
      path: '/'
    })
    
    return response
    
  } catch (error) {
    // console.error('Token refresh error occurred at:', new Date().toISOString())
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}