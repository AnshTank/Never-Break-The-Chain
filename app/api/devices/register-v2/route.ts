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

    const { deviceId, deviceName, deviceType, browser, os, rememberMe = false } = await request.json();

    if (!deviceId) {
      return NextResponse.json({ message: 'Device ID required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const userId = new ObjectId(decoded.userId);
    const now = new Date();
    
    // Calculate expiry based on remember me
    const expiresAt = rememberMe 
      ? new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days
      : new Date(now.getTime() + 12 * 60 * 60 * 1000);     // 12 hours

    // Check if device exists
    const existingDevice = await db.collection('devices').findOne({ userId, deviceId });

    if (existingDevice) {
      // Update existing device
      await db.collection('devices').updateOne(
        { userId, deviceId },
        {
          $set: {
            lastActive: now,
            expiresAt,
            rememberMe,
            isActive: true,
            browser: browser || existingDevice.browser,
            os: os || existingDevice.os
          }
        }
      );
      
      return NextResponse.json({ 
        message: 'Device updated successfully',
        deviceId,
        expiresAt,
        success: true
      });
    }

    // Check device limit (2 max)
    const activeDevicesCount = await db.collection('devices').countDocuments({
      userId,
      isActive: true,
      expiresAt: { $gt: now }
    });

    if (activeDevicesCount >= 2) {
      const existingDevices = await db.collection('devices')
        .find({ 
          userId, 
          isActive: true,
          expiresAt: { $gt: now }
        })
        .sort({ lastActive: -1 })
        .toArray();
      
      return NextResponse.json({
        message: 'Device limit reached (2 max)',
        requiresDeviceSelection: true,
        success: false,
        existingDevices: existingDevices.map(d => ({
          deviceId: d.deviceId,
          deviceName: d.deviceName,
          deviceType: d.deviceType,
          lastActive: d.lastActive,
          browser: d.browser,
          expiresAt: d.expiresAt
        }))
      }, { status: 409 });
    }

    // Register new device
    await db.collection('devices').insertOne({
      userId,
      deviceId,
      deviceName: deviceName || 'Unknown Device',
      deviceType: deviceType || 'desktop',
      browser: browser || 'Unknown',
      os: os || 'Unknown',
      lastActive: now,
      registeredAt: now,
      expiresAt,
      rememberMe,
      isActive: true
    });

    return NextResponse.json({ 
      message: 'Device registered successfully',
      deviceId,
      expiresAt,
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