import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import { ObjectId } from 'mongodb';
import webpush from 'web-push';
import nodemailer from 'nodemailer';

// Configure web-push
webpush.setVapidDetails(
  'mailto:' + (process.env.VAPID_EMAIL || 'anshtank9@gmail.com'),
  process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

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

    // Get user and devices
    const user = await db.collection('users').findOne({ _id: userId });
    const devices = await db.collection('devices').find({ userId, isActive: true }).toArray();
    
    let sent = 0;
    let failed = 0;
    let emailSent = 0;
    let pushSent = 0;

    const messages = {
      morning: { 
        title: '🌅 Good Morning!',
        body: 'Time to build your chain!',
        email: {
          title: '🌅 Rise & Grind, Chain Builder!',
          body: 'Good morning, superstar! ☀️ Your MNZD journey awaits. Today is another chance to prove that consistency beats perfection every single time!',
          motivation: 'Fun fact: You\'re already 100% more awesome than yesterday\'s version of you just by showing up! 💪'
        }
      },
      evening: { 
        title: '🌙 Evening Check-in',
        body: 'How was your day?',
        email: {
          title: '🌙 Evening Reflection Time',
          body: 'Hey there, habit hero! 🦸♀️ How did your MNZD adventure go today? Every small step counts toward your transformation journey.',
          motivation: 'Remember: Rome wasn\'t built in a day, but they were laying bricks every hour. What bricks did you lay today? 🧱'
        }
      },
      missed_day: { 
        title: '🔗 Gentle Reminder',
        body: 'Ready to get back on track?',
        email: {
          title: '🔗 Your Chain Misses You!',
          body: 'Hey champion! 👋 We noticed you took a little detour from your habit highway. No worries - even superheroes need rest days!',
          motivation: 'Plot twist: Comebacks are always stronger than setbacks. Ready to show that chain who\'s boss? 🚀'
        }
      },
      milestone: { 
        title: '🏆 Milestone Achieved!',
        body: 'Amazing work!',
        email: {
          title: '🏆 LEGENDARY ACHIEVEMENT UNLOCKED!',
          body: 'STOP EVERYTHING! 🛑 You just hit a major milestone and we\'re literally doing a happy dance over here! 💃🕺',
          motivation: 'You\'re not just building habits, you\'re building a legacy. This is the stuff legends are made of! 🌟'
        }
      },
      streak: { 
        title: '🔥 Streak Alert!',
        body: 'Keep it going!',
        email: {
          title: '🔥 You\'re ON FIRE!',
          body: 'Alert! Alert! 🚨 We have a consistency champion in the building! Your streak is so hot, it\'s practically glowing! ✨',
          motivation: 'At this rate, you\'ll be teaching masterclasses on "How to Be Awesome Daily." Keep that momentum rolling! 🎯'
        }
      }
    };

    const message = messages[type as keyof typeof messages] || messages.morning;

    // Send real email
    if (user?.email) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: parseInt(process.env.EMAIL_PORT || '587'),
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
        });
        
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: user.email,
          subject: message.email.title,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${message.email.title}</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
              <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <div style="background: white; display: inline-block; padding: 20px; border-radius: 50%; box-shadow: 0 8px 25px rgba(0,0,0,0.15);">
                    <span style="font-size: 48px;">🔗</span>
                  </div>
                  <h1 style="color: white; margin: 20px 0 10px; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                    Never Break The Chain
                  </h1>
                  <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px;">MNZD Habit Tracker</p>
                </div>
                <div style="background: white; border-radius: 20px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); margin-bottom: 20px;">
                  <div style="text-align: center; margin-bottom: 30px;">
                    <h2 style="color: #1e293b; margin: 0 0 15px; font-size: 32px; font-weight: 800;">
                      ${message.email.title}
                    </h2>
                    <div style="width: 60px; height: 4px; background: linear-gradient(90deg, #f59e0b, #ef4444); margin: 0 auto; border-radius: 2px;"></div>
                  </div>
                  <div style="margin-bottom: 30px;">
                    <p style="color: #374151; font-size: 18px; line-height: 1.7; margin: 0 0 20px; text-align: center;">
                      ${message.email.body}
                    </p>
                  </div>
                  <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; border-radius: 15px; padding: 25px; margin: 30px 0;">
                    <p style="color: #92400e; margin: 0; font-size: 16px; font-weight: 600; text-align: center;">
                      💫 ${message.email.motivation}
                    </p>
                  </div>
                  <div style="text-align: center; margin: 40px 0;">
                    <a href="https://never-break-the-chain.vercel.app/dashboard" 
                       style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); color: white; padding: 18px 40px; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 16px; box-shadow: 0 8px 20px rgba(245, 158, 11, 0.4); text-transform: uppercase; letter-spacing: 1px;">
                      Open Dashboard
                    </a>
                  </div>
                  <div style="text-align: center; margin: 30px 0; padding: 20px; background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%); border-radius: 15px; border-left: 5px solid #6366f1;">
                    <p style="color: #3730a3; margin: 0; font-style: italic; font-size: 16px; font-weight: 500;">
                      "We are what we repeatedly do. Excellence, then, is not an act, but a habit." - Aristotle
                    </p>
                  </div>
                </div>
                <div style="text-align: center; color: rgba(255,255,255,0.8); font-size: 14px;">
                  <p style="margin: 0 0 10px;">Keep building your chain, one day at a time! 🔗✨</p>
                  <p style="margin: 0; font-size: 12px; opacity: 0.7;">© 2024 Never Break The Chain by Ansh Tank</p>
                </div>
              </div>
            </body>
            </html>
          `
        });
        
        emailSent = 1;
        sent++;
      } catch (error) {
        console.error('Email failed:', error);
        failed++;
      }
    }

    // Try push notifications
    for (const device of devices) {
      if (device.pushSubscription) {
        try {
          await webpush.sendNotification(
            device.pushSubscription,
            JSON.stringify({
              title: message.title,
              body: message.body,
              icon: '/favicon.svg',
              badge: '/favicon.svg',
              tag: `${type}-notification`,
              data: { url: '/dashboard', type }
            })
          );
          pushSent++;
          sent++;
        } catch (error) {
          console.error('Push failed:', error);
          failed++;
        }
      }
    }

    return NextResponse.json({
      message: `✅ Sent to ${sent} devices, ${failed} failed`,
      sent,
      failed,
      channels: {
        push: { sent: pushSent, failed: 0 },
        email: { sent: emailSent, failed: 0 }
      },
      debug: {
        userId: userId.toString(),
        userEmail: user?.email,
        devicesFound: devices.length,
        devicesWithPush: devices.filter(d => d.pushSubscription).length
      }
    });

  } catch (error) {
    console.error('Test notification error:', error);
    return NextResponse.json(
      { 
        message: 'Error occurred', 
        sent: 0, 
        failed: 1,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}