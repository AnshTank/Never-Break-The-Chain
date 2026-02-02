import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { deviceId } = await request.json();

    if (!deviceId) {
      return NextResponse.json({ error: 'Device ID required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const devices = db.collection('devices');

    // Find the device
    const device = await devices.findOne({ deviceId });

    if (!device) {
      return NextResponse.json({ 
        isRegistered: false,
        isActive: false
      });
    }

    // Check if remember me is still valid
    const isRememberMeValid = device.rememberMe && 
                             device.rememberMeExpiry && 
                             new Date(device.rememberMeExpiry) > new Date();

    // Check if device was active within last 12 hours
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    const isRecentlyActive = device.lastActive && new Date(device.lastActive) > twelveHoursAgo;

    return NextResponse.json({
      isRegistered: true,
      isActive: device.isActive && isRememberMeValid && isRecentlyActive,
      rememberMe: device.rememberMe,
      lastActive: device.lastActive
    });

  } catch (error) {
    console.error('Device status check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}