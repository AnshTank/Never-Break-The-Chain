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

    const { 
      deviceId, 
      sessionId, 
      deviceName, 
      deviceType, 
      browser, 
      os, 
      pushSubscription, 
      rememberMe 
    } = await request.json();

    const { db } = await connectToDatabase();
    const userId = new ObjectId(decoded.userId);
    const now = new Date();
    const rememberMeExpiry = rememberMe ? new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) : undefined;

    // Auto-cleanup: Remove duplicates with same device name
    await db.collection('devices').deleteMany({
      userId,
      deviceName,
      deviceId: { $ne: deviceId }
    });

    // Check if device already exists
    const existingDevice = await db.collection('devices').findOne({
      userId,
      deviceId
    });

    if (existingDevice) {
      // Update existing device
      const updateData: any = {
        lastActive: now,
        lastLogin: now,
        rememberMe,
        rememberMeExpiry,
        isActive: true,
        currentBrowser: browser
      };
      
      // Only update pushSubscription if provided
      if (pushSubscription) {
        updateData.pushSubscription = pushSubscription;
      }
      
      await db.collection('devices').updateOne(
        { userId, deviceId },
        { $set: updateData }
      );
      
      return NextResponse.json({ 
        message: 'Device updated successfully',
        deviceId
      });
    }

    // Check device limit (max 2 devices)
    const deviceCount = await db.collection('devices').countDocuments({
      userId,
      isActive: true,
    });

    if (deviceCount >= 2) {
      const existingDevices = await db.collection('devices')
        .find({ userId, isActive: true })
        .sort({ lastActive: -1 })
        .toArray();

      return NextResponse.json({
        message: 'Device limit reached',
        requiresDeviceSelection: true,
        existingDevices: existingDevices.map(d => ({
          deviceId: d.deviceId,
          deviceName: d.deviceName,
          deviceType: d.deviceType,
          lastActive: d.lastActive
        })),
      }, { status: 409 });
    }

    // Register new device
    await db.collection('devices').insertOne({
      userId,
      deviceId,
      deviceName,
      deviceType,
      browser,
      os,
      lastActive: now,
      lastLogin: now,
      pushSubscription,
      isActive: true,
      registeredAt: now,
      rememberMe,
      rememberMeExpiry,
      currentBrowser: browser
    });

    return NextResponse.json({ 
      message: 'Device registered successfully',
      deviceId 
    });

  } catch (error) {
    console.error('Device registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value || request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const { deviceIdToRemove } = await request.json();
    const { db } = await connectToDatabase();
    const userId = new ObjectId(decoded.userId);

    // Find the device to remove
    const deviceToRemove = await db.collection('devices').findOne({
      userId, 
      deviceId: deviceIdToRemove
    });
    
    if (!deviceToRemove) {
      return NextResponse.json({ message: 'Device not found' }, { status: 404 });
    }

    // Delete the device completely
    await db.collection('devices').deleteOne({
      userId, 
      deviceId: deviceIdToRemove
    });

    // Check if this is the current user's device
    const currentDeviceId = request.headers.get('x-device-id');
    const isCurrentDevice = deviceToRemove.deviceId === currentDeviceId;

    const response = NextResponse.json({ 
      message: 'Device removed successfully',
      shouldLogout: isCurrentDevice,
      redirect: isCurrentDevice ? '/login?message=Device removed successfully' : undefined
    });

    // If removing current device, clear cookies
    if (isCurrentDevice) {
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
    }

    return response;

  } catch (error) {
    console.error('Device removal error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}