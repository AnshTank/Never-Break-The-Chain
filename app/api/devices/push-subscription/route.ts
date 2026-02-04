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

    const { pushSubscription } = await request.json();
    const deviceId = request.headers.get('x-device-id');
    
    if (!pushSubscription || !deviceId) {
      return NextResponse.json({ message: 'Push subscription and device ID required' }, { status: 400 });
    }

    console.log(`Registering push subscription for device ${deviceId}:`, {
      endpoint: pushSubscription.endpoint,
      hasKeys: !!pushSubscription.keys
    });

    const { db } = await connectToDatabase();
    const userId = new ObjectId(decoded.userId);

    // Update device with push subscription
    const result = await db.collection('devices').updateOne(
      { userId, deviceId },
      {
        $set: {
          pushSubscription,
          pushSubscriptionUpdated: new Date(),
          lastActive: new Date()
        }
      }
    );

    console.log(`Push subscription update result:`, {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    });

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Device not found' }, { status: 404 });
    }

    console.log(`✅ Push subscription updated for device ${deviceId}`);

    return NextResponse.json({
      message: 'Push subscription registered successfully',
      deviceId,
      success: true
    });

  } catch (error) {
    console.error('Push subscription error:', error);
    return NextResponse.json(
      { message: 'Failed to register push subscription' },
      { status: 500 }
    );
  }
}