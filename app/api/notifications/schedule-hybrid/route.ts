import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const now = new Date();
    
    // Get all users who need notifications
    const users = await db.collection('users').find({
      emailVerified: true,
      isActive: true
    }).toArray();

    let scheduled = 0;
    let failed = 0;

    for (const user of users) {
      try {
        // Check user's last activity across all devices
        const lastActivity = await db.collection('devices').findOne(
          { userId: user._id, isActive: true },
          { sort: { lastActive: -1 } }
        );

        const isRecentlyActive = lastActivity && 
          (now.getTime() - new Date(lastActivity.lastActive).getTime()) < 24 * 60 * 60 * 1000;

        // Schedule notification based on activity
        await db.collection('notifications').insertOne({
          userId: user._id,
          type: 'scheduled',
          channel: isRecentlyActive ? 'push' : 'email',
          fallbackChannel: 'email',
          status: 'pending',
          scheduledAt: now,
          sendAt: new Date(now.getTime() + 5 * 60 * 1000), // 5 minutes from now
          message: {
            title: '🔗 Your Chain Awaits',
            body: 'Time to continue your MNZD journey! Every day counts.',
            email: {
              subject: '🔗 Never Break The Chain - Daily Reminder',
              template: 'daily-reminder'
            }
          }
        });

        scheduled++;
      } catch (error) {
        console.error(`Failed to schedule for user ${user._id}:`, error);
        failed++;
      }
    }

    return NextResponse.json({
      message: `Scheduled notifications for ${scheduled} users, ${failed} failed`,
      scheduled,
      failed,
      timestamp: now
    });

  } catch (error) {
    console.error('Notification scheduling error:', error);
    return NextResponse.json(
      { message: 'Scheduling failed', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}