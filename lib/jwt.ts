import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
const JWT_EXPIRES_IN = '12h' // Changed to 12 hours for inactivity timeout
const REFRESH_TOKEN_EXPIRES_IN = '90d' // Extended to 90 days

export interface JWTPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
}

export function generateTokens(payload: { userId: string; email: string }, rememberMe: boolean = false) {
  const accessTokenExpiry = rememberMe ? '7d' : JWT_EXPIRES_IN // 7 days if remember me, 12h otherwise
  const refreshTokenExpiry = rememberMe ? '365d' : REFRESH_TOKEN_EXPIRES_IN // 1 year if remember me
  
  const accessToken = jwt.sign(payload, JWT_SECRET, { 
    expiresIn: accessTokenExpiry,
    issuer: 'journey-tracker',
    audience: 'journey-tracker-users'
  })
  
  const refreshToken = jwt.sign(payload, JWT_SECRET, { 
    expiresIn: refreshTokenExpiry,
    issuer: 'journey-tracker',
    audience: 'journey-tracker-refresh'
  })
  
  return { 
    accessToken, 
    refreshToken,
    accessTokenMaxAge: rememberMe ? 7 * 24 * 60 * 60 : 12 * 60 * 60, // 7 days or 12 hours
    refreshTokenMaxAge: rememberMe ? 365 * 24 * 60 * 60 : 90 * 24 * 60 * 60
  }
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'journey-tracker',
      audience: 'journey-tracker-users'
    }) as JWTPayload
    return decoded
  } catch (error) {
    return null
  }
}

export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'journey-tracker',
      audience: 'journey-tracker-refresh'
    }) as JWTPayload
    return decoded
  } catch (error) {
    return null
  }
}

export function isTokenExpiringSoon(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as JWTPayload
    if (!decoded || !decoded.exp) return true
    
    const now = Math.floor(Date.now() / 1000)
    const timeUntilExpiry = decoded.exp - now
    
    // Refresh if token expires within 2 hours
    return timeUntilExpiry < 2 * 60 * 60
  } catch {
    return true
  }
}

export function extractTokenFromRequest(request: NextRequest): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  // Try cookie as fallback
  const tokenCookie = request.cookies.get('auth-token')
  return tokenCookie?.value || null
}

export function getUserFromRequest(request: NextRequest): JWTPayload | null {
  const token = extractTokenFromRequest(request)
  if (!token) return null
  
  return verifyToken(token)
}