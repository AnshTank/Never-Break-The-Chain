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

    const { deviceId: providedDeviceId } = await request.json();
    const deviceId = providedDeviceId || getDeviceId();
    
    const { db } = await connectToDatabase();
    const userId = new ObjectId(decoded.userId);

    // Check if current device is registered and active
    const currentDevice = await db.collection('devices').findOne({
      userId,
      deviceId,
      isActive: true
    });

    // Get total active devices count
    const activeDevicesCount = await db.collection('devices').countDocuments({
      userId,
      isActive: true
    });

    // Get all active devices for display
    const activeDevices = await db.collection('devices')
      .find({ userId, isActive: true })
      .sort({ lastActive: -1 })
      .toArray();

    const response = {
      isDeviceRegistered: !!currentDevice,
      canAccess: !!currentDevice,
      activeDevicesCount,
      deviceLimit: 2,
      isAtLimit: activeDevicesCount >= 2,
      needsDeviceSelection: !currentDevice && activeDevicesCount >= 2,
      currentDeviceId: deviceId,
      activeDevices: activeDevices.map(d => ({
        deviceId: d.deviceId,
        deviceName: d.deviceName,
        deviceType: d.deviceType,
        lastActive: d.lastActive,
        browser: d.currentBrowser || d.browser,
        isCurrentDevice: d.deviceId === deviceId
      }))
    };

    console.log(`Device validation for user ${userId}:`, {
      deviceId,
      isRegistered: response.isDeviceRegistered,
      activeCount: activeDevicesCount,
      needsSelection: response.needsDeviceSelection
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('Device validation error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}