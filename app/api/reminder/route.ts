import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { sendWelcomeFlowReminder } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    // Security check - only allow from localhost or specific origins
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    
    if (process.env.NODE_ENV === 'production' && 
        !host?.includes('vercel.app') && 
        !origin?.includes('vercel.app')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const users = db.collection('users');

    // Calculate date 2 days ago
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    // Find users who:
    // 1. Have verified email (emailVerified: true)
    // 2. Still need password setup (needsPasswordSetup: true)
    // 3. Created account more than 2 days ago
    // 4. Haven't been sent a reminder in the last 24 hours (or never sent)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const incompleteUsers = await users.find({
      emailVerified: true,
      needsPasswordSetup: true,
      createdAt: { $lt: twoDaysAgo },
      $or: [
        { lastReminderSent: { $exists: false } },
        { lastReminderSent: { $lt: oneDayAgo } }
      ]
    }).toArray();

    let emailsSent = 0;
    let emailsFailed = 0;

    for (const user of incompleteUsers) {
      try {
        const userName = user.name || user.email.split('@')[0];
        const emailSent = await sendWelcomeFlowReminder(userName, user.email);
        
        if (emailSent) {
          // Update user with reminder timestamp
          await users.updateOne(
            { _id: user._id },
            { 
              $set: { 
                lastReminderSent: new Date(),
                reminderCount: (user.reminderCount || 0) + 1
              } 
            }
          );
          emailsSent++;
        } else {
          emailsFailed++;
        }
      } catch (error) {
        console.error(`Failed to send reminder to ${user.email}:`, error);
        emailsFailed++;
      }
    }

    return NextResponse.json({
      message: 'Welcome flow reminders processed',
      totalUsers: incompleteUsers.length,
      emailsSent,
      emailsFailed,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Welcome flow reminder error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}