import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken, verifyRefreshToken, generateTokens, isTokenExpiringSoon } from '@/lib/jwt'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export const runtime = 'nodejs'

const publicPaths = ['/login', '/signup', '/forgot-password', '/delete-account', '/api/auth/login', '/api/auth/signup', '/api/auth/setup-password', '/api/auth/forgot-password', '/api/auth/delete-account', '/api/auth/resend-setup']
const apiAuthPaths = ['/api/auth/refresh', '/api/auth/logout', '/api/auth/cleanup', '/api/progress', '/api/user', '/api/analytics', '/api/timer-data', '/api/settings']
const welcomeRequiredPaths = ['/welcome']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check for authentication token first
  const token = request.cookies.get('auth-token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')
  
  // If user is authenticated and on home page, redirect to dashboard
  if (pathname === '/' && token) {
    const payload = verifyToken(token)
    if (payload) {
      // Check if user needs welcome flow
      try {
        const { db } = await connectToDatabase()
        const users = db.collection('users')
        const user = await users.findOne(
          { _id: new ObjectId(payload.userId) },
          { projection: { isNewUser: 1, needsPasswordSetup: 1, password: 1 } }
        )
        
        if (user && !user.isNewUser && !user.needsPasswordSetup && user.password) {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      } catch (error) {
        console.error('Error checking user status:', error)
      }
    }
  }
  
  // Allow public paths (excluding home page which is handled above)
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }
  
  // Allow home page for unauthenticated users
  if (pathname === '/') {
    return NextResponse.next()
  }
  
  // Handle auth API endpoints that need authentication
  if (apiAuthPaths.some(path => pathname.startsWith(path))) {
    // These endpoints need authentication, so continue with token verification
  }
  
  // Token already checked above for home page redirect
  
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
        // Generate new tokens with remember me detection
        const isLongLived = !!(refreshPayload.exp && (refreshPayload.exp - refreshPayload.iat!) > (100 * 24 * 60 * 60)) // More than 100 days means remember me was used
        const { accessToken, refreshToken: newRefreshToken, accessTokenMaxAge, refreshTokenMaxAge } = generateTokens({
          userId: refreshPayload.userId,
          email: refreshPayload.email
        }, isLongLived)
        
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
      
      // If user doesn't exist (deleted account), redirect to login
      if (!user) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'User not found' }, { status: 401 })
        }
        const response = NextResponse.redirect(new URL('/login', request.url))
        // Clear cookies for deleted user
        response.cookies.set('auth-token', '', { maxAge: 0, path: '/' })
        response.cookies.set('refresh-token', '', { maxAge: 0, path: '/' })
        return response
      }
      
      if (user.isNewUser || user.needsPasswordSetup || !user.password) {
        return NextResponse.redirect(new URL('/welcome', request.url))
      }
    } catch (error) {
      console.error('Error checking user welcome status:', error)
      // On database error, redirect to login to be safe
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Database error' }, { status: 500 })
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  // Check if token is expiring soon and refresh proactively
  if (isTokenExpiringSoon(token)) {
    const refreshToken = request.cookies.get('refresh-token')?.value
    if (refreshToken) {
      const refreshPayload = verifyRefreshToken(refreshToken)
      if (refreshPayload) {
        // Detect remember me setting from refresh token expiration
        const isLongLived = !!(refreshPayload.exp && (refreshPayload.exp - refreshPayload.iat!) > (100 * 24 * 60 * 60))
        const { accessToken, refreshToken: newRefreshToken, accessTokenMaxAge, refreshTokenMaxAge } = generateTokens({
          userId: payload.userId,
          email: payload.email
        }, isLongLived)
      
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