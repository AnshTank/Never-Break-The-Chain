import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { DeviceSessionManager } from '@/lib/device-session-manager';
import { connectToDatabase } from '@/lib/mongodb';
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

    const { 
      deviceId, 
      deviceName, 
      deviceType, 
      browser, 
      os, 
      pushSubscription, 
      rememberMe = false,
      forceRegister = false
    } = await request.json();

    if (!deviceId) {
      return NextResponse.json({ message: 'Device ID required' }, { status: 400 });
    }

    // Register device without limit restrictions
    await DeviceSessionManager.registerDevice(
      decoded.userId,
      {
        deviceId,
        deviceName: deviceName || 'Unknown Device',
        deviceType: deviceType || 'desktop',
        browser: browser || 'Unknown',
        os: os || 'Unknown',
        rememberMe,
        pushSubscription
      },
      true // Always force register (no limits)
    );

    // If push subscription was provided, make sure it's saved
    if (pushSubscription) {
      try {
        const { db } = await connectToDatabase();
        await db.collection('devices').updateOne(
          { userId: new ObjectId(decoded.userId), deviceId },
          {
            $set: {
              pushSubscription,
              pushSubscriptionUpdated: new Date()
            }
          }
        );
        console.log(`✅ Push subscription saved during device registration for ${deviceId}`);
      } catch (pushError) {
        console.error('Failed to save push subscription during registration:', pushError);
      }
    }

    // Email notifications only - no push notifications
    console.log('Device registered successfully for user:', decoded.userId);

    return NextResponse.json({ 
      message: 'Device registered successfully',
      deviceId,
      success: true
    });

  } catch (error) {
    console.error('Device registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { deviceId } = await request.json();
    if (!deviceId) {
      return NextResponse.json({ error: 'Device ID required' }, { status: 400 });
    }

    await DeviceSessionManager.removeDevice(userId, deviceId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Device removal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}