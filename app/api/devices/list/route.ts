import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const currentDeviceId = request.headers.get('x-device-id') || request.cookies.get('device-id')?.value;
    
    // Get user's email notification setting
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { emailNotifications: 1 } }
    );
    
    const devices = await db.collection('devices')
      .find({ userId: new ObjectId(userId), isActive: true })
      .sort({ lastActive: -1 })
      .toArray();

    const devicesWithStatus = devices.map(device => ({
      deviceId: device.deviceId,
      deviceName: device.deviceName,
      deviceType: device.deviceType,
      browser: device.browser,
      os: device.os,
      lastActive: device.lastActive,
      isCurrentDevice: device.deviceId === currentDeviceId,
      hasNotifications: user?.emailNotifications !== false
    }));

    return NextResponse.json({ 
      devices: devicesWithStatus,
      emailNotifications: user?.emailNotifications !== false
    });
  } catch (error) {
    console.error('Device list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}