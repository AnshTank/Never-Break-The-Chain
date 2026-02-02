import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value || request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const userId = new ObjectId(decoded.userId);

    const devices = await db.collection('devices')
      .find({ userId, isActive: true })
      .sort({ lastActive: -1 })
      .toArray();

    const deviceList = devices.map(device => ({
      deviceId: device.deviceId,
      deviceName: device.deviceName,
      deviceType: device.deviceType,
      browser: device.currentBrowser || device.browser,
      os: device.os,
      lastActive: device.lastActive,
      lastLogin: device.lastLogin,
      registeredAt: device.registeredAt,
      hasNotifications: !!device.pushSubscription,
      rememberMe: device.rememberMe || false,
      rememberMeExpiry: device.rememberMeExpiry
    }));

    return NextResponse.json({ devices: deviceList });

  } catch (error) {
    console.error('Device list error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}