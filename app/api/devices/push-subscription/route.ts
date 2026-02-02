import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import { ObjectId } from 'mongodb';
import { getDeviceId } from '@/lib/device-id';

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

    const { pushSubscription } = await request.json();
    const { db } = await connectToDatabase();
    const userId = new ObjectId(decoded.userId);
    
    // Get current device ID from headers or generate one
    const deviceId = request.headers.get('x-device-id') || getDeviceId();

    // Update device with push subscription
    const result = await db.collection('devices').updateOne(
      { userId, deviceId },
      { 
        $set: { 
          pushSubscription,
          lastActive: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Device not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Push subscription registered successfully'
    });

  } catch (error) {
    console.error('Push subscription registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}