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
    const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const defaultPreferences = {
      emailNotifications: { enabled: true },
      morningEmail: { enabled: true, time: '07:00' },
      eveningEmail: { enabled: true, time: '20:00' },
      milestoneEmails: { enabled: true },
      streakEmails: { enabled: true }
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

    // Validate email notification preferences only
    const validPreferences = {
      emailNotifications: {
        enabled: Boolean(preferences.emailNotifications?.enabled !== false)
      },
      morningEmail: {
        enabled: Boolean(preferences.morningEmail?.enabled !== false),
        time: preferences.morningEmail?.time || '07:00'
      },
      eveningEmail: {
        enabled: Boolean(preferences.eveningEmail?.enabled !== false),
        time: preferences.eveningEmail?.time || '20:00'
      },
      milestoneEmails: {
        enabled: Boolean(preferences.milestoneEmails?.enabled !== false)
      },
      streakEmails: {
        enabled: Boolean(preferences.streakEmails?.enabled !== false)
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

    // Email notification preferences only


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