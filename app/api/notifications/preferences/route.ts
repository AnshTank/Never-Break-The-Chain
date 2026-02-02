import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import { ObjectId } from 'mongodb';
import { NotificationScheduler } from '@/lib/notification-scheduler';

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
    const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const defaultPreferences = {
      morningReminder: { enabled: true, time: '07:00' },
      eveningReminder: { enabled: true, time: '20:00' },
      missedDayReminder: { enabled: true },
      milestoneAlerts: { enabled: true },
      streakAlerts: { enabled: true },
      emailNotifications: { enabled: true },
      pushNotifications: { enabled: true }
    };

    return NextResponse.json({
      preferences: user.notificationPreferences || defaultPreferences
    });

  } catch (error) {
    console.error('Get preferences error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const preferences = await request.json();
    const { db } = await connectToDatabase();

    // Validate preferences structure
    const validPreferences = {
      morningReminder: {
        enabled: Boolean(preferences.morningReminder?.enabled),
        time: preferences.morningReminder?.time || '07:00'
      },
      eveningReminder: {
        enabled: Boolean(preferences.eveningReminder?.enabled),
        time: preferences.eveningReminder?.time || '20:00'
      },
      missedDayReminder: {
        enabled: Boolean(preferences.missedDayReminder?.enabled)
      },
      milestoneAlerts: {
        enabled: Boolean(preferences.milestoneAlerts?.enabled)
      },
      streakAlerts: {
        enabled: Boolean(preferences.streakAlerts?.enabled)
      },
      emailNotifications: {
        enabled: Boolean(preferences.emailNotifications?.enabled)
      },
      pushNotifications: {
        enabled: Boolean(preferences.pushNotifications?.enabled)
      }
    };

    // Update user preferences
    await db.collection('users').updateOne(
      { _id: new ObjectId(decoded.userId) },
      { 
        $set: { 
          notificationPreferences: validPreferences,
          updatedAt: new Date()
        } 
      }
    );

    // Reschedule notifications based on new preferences
    try {
      await NotificationScheduler.setupUserNotifications(decoded.userId);
    } catch (error) {
      console.warn('Failed to reschedule notifications:', error);
    }

    return NextResponse.json({
      message: 'Preferences updated successfully',
      preferences: validPreferences
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}