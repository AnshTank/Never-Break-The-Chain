import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken, verifyRefreshToken, generateTokens, isTokenExpiringSoon } from '@/lib/jwt'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export const runtime = 'nodejs'

const publicPaths = ['/login', '/signup', '/api/auth/login', '/api/auth/signup', '/api/auth/setup-password']
const apiAuthPaths = ['/api/auth/refresh', '/api/auth/logout', '/api/auth/cleanup']
const welcomeRequiredPaths = ['/welcome']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Allow public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }
  
  // Handle auth API endpoints
  if (apiAuthPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }
  
  // Check for authentication token
  const token = request.cookies.get('auth-token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')
  
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Verify token
  const payload = verifyToken(token)
  if (!payload) {
    // Try refresh token for seamless renewal
    const refreshToken = request.cookies.get('refresh-token')?.value
    if (refreshToken) {
      const refreshPayload = verifyRefreshToken(refreshToken)
      if (refreshPayload) {
        // Generate new tokens
        const { accessToken, refreshToken: newRefreshToken, accessTokenMaxAge, refreshTokenMaxAge } = generateTokens({
          userId: refreshPayload.userId,
          email: refreshPayload.email
        })
        
        const response = NextResponse.next()
        
        // Set new cookies with original expiration times
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
        
        // Add user info to headers
        response.headers.set('x-user-id', refreshPayload.userId)
        response.headers.set('x-user-email', refreshPayload.email)
        
        return response
      }
    }
    
    // Both tokens invalid - only redirect if no valid refresh token
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Check if user needs to complete welcome flow (only for page routes, not static assets)
  if (!welcomeRequiredPaths.some(path => pathname.startsWith(path)) && !pathname.startsWith('/_next') && !pathname.includes('.') && !pathname.startsWith('/api/')) {
    try {
      const { db } = await connectToDatabase()
      const users = db.collection('users')
      const user = await users.findOne({ _id: new ObjectId(payload.userId) })
      
      if (user && (user.isNewUser || user.needsPasswordSetup)) {
        return NextResponse.redirect(new URL('/welcome', request.url))
      }
    } catch (error) {
      console.error('Error checking user welcome status:', error)
    }
  }
  
  // Check if token is expiring soon and refresh proactively
  if (isTokenExpiringSoon(token)) {
    const refreshToken = request.cookies.get('refresh-token')?.value
    if (refreshToken && verifyRefreshToken(refreshToken)) {
      const { accessToken, refreshToken: newRefreshToken, accessTokenMaxAge, refreshTokenMaxAge } = generateTokens({
        userId: payload.userId,
        email: payload.email
      })
      
      const response = NextResponse.next()
      
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
      
      response.headers.set('x-user-id', payload.userId)
      response.headers.set('x-user-email', payload.email)
      
      return response
    }
  }
  
  // Add user info to request headers for API routes
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', payload.userId)
  requestHeaders.set('x-user-email', payload.email)
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}