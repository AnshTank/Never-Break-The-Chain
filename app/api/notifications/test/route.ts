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

    const { type } = await request.json();
    const { db } = await connectToDatabase();
    const userId = new ObjectId(decoded.userId);

    // Get all active devices with push subscriptions
    const devices = await db.collection('devices').find({
      userId,
      isActive: true,
      pushSubscription: { $exists: true, $ne: null }
    }).toArray();

    let sent = 0;
    let failed = 0;

    const messages = {
      morning: {
        title: '🌅 Good Morning!',
        body: 'Rise and shine! Time to start building your chain today! ✨'
      },
      evening: {
        title: '🌙 Evening Check-in',
        body: 'How did your MNZD journey go today? Every step counts! 🎯'
      },
      missed: {
        title: '🔗 Gentle Reminder',
        body: 'Your chain misses you! Ready to get back on track? 💪'
      }
    };

    const message = messages[type as keyof typeof messages] || messages.morning;

    // Send notifications to all devices
    for (const device of devices) {
      try {
        // For now, just count as sent since we don't have actual push service
        // In production, you'd use web-push library here
        console.log(`Sending notification to device ${device.deviceId}:`, message);
        sent++;
      } catch (error) {
        console.error(`Failed to send to device ${device.deviceId}:`, error);
        failed++;
      }
    }

    return NextResponse.json({
      message: `Sent to ${sent} devices, ${failed} failed`,
      sent,
      failed,
      totalDevices: devices.length
    });

  } catch (error) {
    console.error('Test notification error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}