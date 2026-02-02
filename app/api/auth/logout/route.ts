import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { verifyToken } from '@/lib/jwt'
import { ObjectId } from 'mongodb'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Get token and clear device remember me if authenticated
    const token = request.cookies.get('auth-token')?.value;
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        try {
          const { db } = await connectToDatabase();
          const userId = new ObjectId(decoded.userId);
          
          // Clear remember me for all user devices
          await db.collection('devices').updateMany(
            { userId },
            { 
              $set: { 
                rememberMe: false,
                rememberMeExpiry: null,
                lastActive: new Date()
              } 
            }
          );
        } catch (dbError) {
          console.error('Failed to clear device remember me:', dbError);
        }
      }
    }

    const response = NextResponse.json({ message: 'Logged out successfully' }, { status: 200 })
    
    // Clear authentication cookies
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    })
    
    response.cookies.set('refresh-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    })
    
    return response
  } catch (error) {
    // console.error('Logout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}