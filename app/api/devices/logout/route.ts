import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value || request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const { deviceId } = await request.json();
    const { db } = await connectToDatabase();
    const userId = new ObjectId(decoded.userId);

    // Deactivate the device
    await db.collection('devices').updateOne(
      { userId, deviceId },
      { 
        $set: { 
          isActive: false,
          rememberMe: false,
          rememberMeExpiry: null,
          lastActive: new Date()
        } 
      }
    );

    // Create response with cleared cookies
    const response = NextResponse.json({ 
      message: 'Device logged out successfully',
      redirect: '/login'
    });

    // Clear authentication cookies
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    });

    response.cookies.set('refresh-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Device logout error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}