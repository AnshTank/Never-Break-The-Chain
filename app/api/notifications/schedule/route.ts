import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import { EnhancedNotificationService } from '@/lib/enhanced-notification-service';

export async function POST(request: NextRequest) {
  try {
    // Debug: Log all cookies
    console.log('All cookies:', request.cookies.getAll());
    
    const token = request.cookies.get('auth-token')?.value || request.cookies.get('token')?.value;
    console.log('Token found:', !!token);
    
    if (!token) {
      console.log('No token in cookies');
      return NextResponse.json({ message: 'No authentication token found' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    console.log('Token decoded:', !!decoded);
    
    if (!decoded) {
      console.log('Token verification failed');
      return NextResponse.json({ message: 'Invalid authentication token' }, { status: 401 });
    }

    const { type } = await request.json();
    const userId = decoded.userId;
    
    console.log('Processing notification for user:', userId, 'type:', type);
    
    if (!type) {
      return NextResponse.json({ message: 'Missing type parameter' }, { status: 400 });
    }

    let payload;
    switch (type) {
      case 'morning':
        payload = EnhancedNotificationService.getMorningReminderPayload();
        break;
      case 'evening':
        payload = EnhancedNotificationService.getEveningReminderPayload();
        break;
      case 'missed_day':
        payload = EnhancedNotificationService.getMissedDayPayload();
        break;
      default:
        return NextResponse.json({ message: 'Invalid notification type' }, { status: 400 });
    }

    const result = await EnhancedNotificationService.sendToAllUserDevices(userId, payload);
    
    return NextResponse.json({
      message: 'Notifications sent',
      sent: result.sent,
      failed: result.failed
    });

  } catch (error) {
    console.error('Scheduled notification error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Endpoint to send notifications to all users (for cron jobs)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const secret = searchParams.get('secret');

    // Verify cron secret (set this in your environment variables)
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!type || !['morning', 'evening'].includes(type)) {
      return NextResponse.json({ message: 'Invalid type' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    // Get all users with active devices
    const usersWithDevices = await db.collection('devices').aggregate([
      { $match: { isActive: true, pushSubscription: { $exists: true, $ne: null } } },
      { $group: { _id: '$userId' } }
    ]).toArray();

    let totalSent = 0;
    let totalFailed = 0;

    for (const user of usersWithDevices) {
      const payload = type === 'morning' 
        ? EnhancedNotificationService.getMorningReminderPayload()
        : EnhancedNotificationService.getEveningReminderPayload();

      const result = await EnhancedNotificationService.sendToAllUserDevices(
        user._id.toString(), 
        payload
      );
      
      totalSent += result.sent;
      totalFailed += result.failed;
    }

    return NextResponse.json({
      message: `${type} notifications sent`,
      users: usersWithDevices.length,
      sent: totalSent,
      failed: totalFailed
    });

  } catch (error) {
    console.error('Bulk notification error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}