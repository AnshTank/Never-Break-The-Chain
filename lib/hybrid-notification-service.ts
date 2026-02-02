import { connectToDatabase } from './mongodb';
import { ObjectId } from 'mongodb';
import webpush from 'web-push';
import nodemailer from 'nodemailer';

// Configure web-push
webpush.setVapidDetails(
  'mailto:' + (process.env.VAPID_EMAIL || 'anshtank9@gmail.com'),
  process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

// Simple email function
const sendEmail = async (options: { to: string; subject: string; html: string }) => {
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
    to: options.to,
    subject: options.subject,
    html: options.html
  });
};

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  requireInteraction?: boolean;
  actions?: Array<{ action: string; title: string; icon?: string }>;
}

export interface NotificationResult {
  sent: number;
  failed: number;
  channels: {
    push: { sent: number; failed: number };
    email: { sent: number; failed: number };
  };
}

export class HybridNotificationService {
  private static readonly ACTIVITY_THRESHOLD = 24 * 60 * 60 * 1000; // 24 hours

  static async sendNotification(
    userId: string,
    payload: NotificationPayload,
    options: {
      forceEmail?: boolean;
      emailTemplate?: string;
      priority?: 'low' | 'normal' | 'high';
    } = {}
  ): Promise<NotificationResult> {
    const { db } = await connectToDatabase();
    const userObjectId = new ObjectId(userId);
    const now = new Date();

    const result: NotificationResult = {
      sent: 0,
      failed: 0,
      channels: {
        push: { sent: 0, failed: 0 },
        email: { sent: 0, failed: 0 }
      }
    };

    try {
      // Get user info
      const user = await db.collection('users').findOne({ _id: userObjectId });
      if (!user) {
        console.error('User not found:', userId);
        result.failed = 1;
        return result;
      }

      // Get active devices
      const devices = await db.collection('devices')
        .find({ 
          userId: userObjectId, 
          isActive: true, 
          expiresAt: { $gt: now } 
        })
        .toArray();

      console.log(`Found ${devices.length} active devices for user ${userId}`);

      // Determine delivery strategy
      const recentlyActive = devices.some(d => 
        new Date(d.lastActive).getTime() > (now.getTime() - this.ACTIVITY_THRESHOLD)
      );

      const shouldUsePush = recentlyActive && !options.forceEmail;
      const shouldUseEmail = !recentlyActive || options.forceEmail || options.priority === 'high';

      console.log(`Delivery strategy: push=${shouldUsePush}, email=${shouldUseEmail}`);

      // Send push notifications
      if (shouldUsePush && devices.length > 0) {
        for (const device of devices) {
          if (device.pushSubscription) {
            try {
              await webpush.sendNotification(
                device.pushSubscription,
                JSON.stringify(payload)
              );
              result.channels.push.sent++;
              result.sent++;
              console.log(`✅ Push sent to device ${device.deviceId}`);
            } catch (error) {
              console.error(`❌ Push failed for device ${device.deviceId}:`, error);
              result.channels.push.failed++;
              result.failed++;
            }
          } else {
            console.log(`📱 Device ${device.deviceId} has no push subscription`);
          }
        }
      }

      // Send email notification
      if (shouldUseEmail) {
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
          
          const emailData = (payload as any).email;
          await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: emailData?.title || payload.title,
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${emailData?.title || payload.title}</title>
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
                        ${emailData?.title || payload.title}
                      </h2>
                      <div style="width: 60px; height: 4px; background: linear-gradient(90deg, #f59e0b, #ef4444); margin: 0 auto; border-radius: 2px;"></div>
                    </div>
                    <div style="margin-bottom: 30px;">
                      <p style="color: #374151; font-size: 18px; line-height: 1.7; margin: 0 0 20px; text-align: center;">
                        ${emailData?.body || payload.body}
                      </p>
                    </div>
                    ${emailData?.motivation ? `
                    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; border-radius: 15px; padding: 25px; margin: 30px 0;">
                      <p style="color: #92400e; margin: 0; font-size: 16px; font-weight: 600; text-align: center;">
                        💫 ${emailData.motivation}
                      </p>
                    </div>
                    ` : ''}
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
          result.channels.email.sent++;
          result.sent++;
        } catch (error) {
          console.error('Email notification failed:', error);
          result.channels.email.failed++;
          result.failed++;
        }
      }

      // If no delivery method worked, count as failed
      if (result.sent === 0 && !shouldUsePush && !shouldUseEmail) {
        result.failed = 1;
      }

      // Log notification
      await db.collection('notification_logs').insertOne({
        userId: userObjectId,
        type: payload.tag || 'general',
        title: payload.title,
        sentAt: now,
        channels: {
          push: shouldUsePush,
          email: shouldUseEmail
        },
        result,
        payload
      });

      console.log(`Notification result:`, result);
      return result;
      
    } catch (error) {
      console.error('Notification service error:', error);
      result.failed = 1;
      return result;
    }
  }

  static async scheduleNotification(
    userId: string,
    payload: NotificationPayload,
    scheduledFor: Date,
    options: {
      type: 'morning' | 'evening' | 'missed_day' | 'milestone' | 'streak' | 'random';
      recurring?: boolean;
      emailTemplate?: string;
    }
  ): Promise<void> {
    const { db } = await connectToDatabase();
    const userObjectId = new ObjectId(userId);

    await db.collection('scheduled_notifications').insertOne({
      userId: userObjectId,
      payload,
      scheduledFor,
      type: options.type,
      recurring: options.recurring || false,
      emailTemplate: options.emailTemplate,
      status: 'pending',
      createdAt: new Date()
    });
  }

  static async processScheduledNotifications(): Promise<void> {
    const { db } = await connectToDatabase();
    const now = new Date();

    const pendingNotifications = await db.collection('scheduled_notifications')
      .find({
        status: 'pending',
        scheduledFor: { $lte: now }
      })
      .toArray();

    for (const notification of pendingNotifications) {
      try {
        await this.sendNotification(
          notification.userId.toString(),
          notification.payload,
          {
            emailTemplate: notification.emailTemplate,
            priority: notification.type === 'milestone' ? 'high' : 'normal'
          }
        );

        // Update status
        await db.collection('scheduled_notifications').updateOne(
          { _id: notification._id },
          { 
            $set: { 
              status: 'sent', 
              sentAt: now 
            } 
          }
        );

        // Schedule next occurrence if recurring
        if (notification.recurring) {
          const nextSchedule = this.getNextScheduleTime(notification.type, now);
          if (nextSchedule) {
            await db.collection('scheduled_notifications').insertOne({
              ...notification,
              _id: undefined,
              scheduledFor: nextSchedule,
              status: 'pending',
              createdAt: now
            });
          }
        }
      } catch (error) {
        console.error('Failed to send scheduled notification:', error);
        await db.collection('scheduled_notifications').updateOne(
          { _id: notification._id },
          { 
            $set: { 
              status: 'failed', 
              error: error instanceof Error ? error.message : 'Unknown error',
              failedAt: now 
            } 
          }
        );
      }
    }
  }

  private static getNextScheduleTime(type: string, from: Date): Date | null {
    const next = new Date(from);
    
    switch (type) {
      case 'morning':
        next.setDate(next.getDate() + 1);
        next.setHours(7, 0, 0, 0);
        return next;
      case 'evening':
        next.setDate(next.getDate() + 1);
        next.setHours(20, 0, 0, 0);
        return next;
      default:
        return null;
    }
  }

  private static generateEmailContent(payload: NotificationPayload, template?: string): string {
    const emailData = (payload as any).email;
    
    const baseTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${emailData?.title || payload.title}</title>
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
                ${emailData?.title || payload.title}
              </h2>
              <div style="width: 60px; height: 4px; background: linear-gradient(90deg, #f59e0b, #ef4444); margin: 0 auto; border-radius: 2px;"></div>
            </div>
            <div style="margin-bottom: 30px;">
              <p style="color: #374151; font-size: 18px; line-height: 1.7; margin: 0 0 20px; text-align: center;">
                ${emailData?.body || payload.body}
              </p>
            </div>
            ${emailData?.motivation ? `
            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; border-radius: 15px; padding: 25px; margin: 30px 0;">
              <p style="color: #92400e; margin: 0; font-size: 16px; font-weight: 600; text-align: center;">
                💫 ${emailData.motivation}
              </p>
            </div>
            ` : ''}
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
    `;

    return template || baseTemplate;
  }

  static getNotificationTemplates() {
    return {
      morning: {
        title: '🌅 Good Morning!',
        body: 'Time to build your chain!',
        tag: 'morning-reminder',
        data: { url: '/dashboard', type: 'morning' },
        email: {
          title: '🌅 Rise & Grind, Chain Builder!',
          body: 'Good morning, superstar! ☀️ Your MNZD journey awaits. Today is another chance to prove that consistency beats perfection every single time!',
          motivation: 'Fun fact: You\'re already 100% more awesome than yesterday\'s version of you just by showing up! 💪'
        }
      },
      evening: {
        title: '🌙 Evening Check-in',
        body: 'How was your day?',
        tag: 'evening-checkin',
        data: { url: '/dashboard', type: 'evening' },
        email: {
          title: '🌙 Evening Reflection Time',
          body: 'Hey there, habit hero! 🦸♀️ How did your MNZD adventure go today? Every small step counts toward your transformation journey.',
          motivation: 'Remember: Rome wasn\'t built in a day, but they were laying bricks every hour. What bricks did you lay today? 🧱'
        }
      },
      missed_day: {
        title: '🔗 Gentle Reminder',
        body: 'Ready to get back on track?',
        tag: 'missed-reminder',
        data: { url: '/dashboard', type: 'missed' },
        email: {
          title: '🔗 Your Chain Misses You!',
          body: 'Hey champion! 👋 We noticed you took a little detour from your habit highway. No worries - even superheroes need rest days!',
          motivation: 'Plot twist: Comebacks are always stronger than setbacks. Ready to show that chain who\'s boss? 🚀'
        }
      },
      milestone: {
        title: '🏆 Milestone Achieved!',
        body: 'Amazing work!',
        tag: 'milestone-celebration',
        requireInteraction: true,
        data: { url: '/dashboard', type: 'milestone' },
        email: {
          title: '🏆 LEGENDARY ACHIEVEMENT UNLOCKED!',
          body: 'STOP EVERYTHING! 🛑 You just hit a major milestone and we\'re literally doing a happy dance over here! 💃🕺',
          motivation: 'You\'re not just building habits, you\'re building a legacy. This is the stuff legends are made of! 🌟'
        }
      },
      streak: {
        title: '🔥 Streak Alert!',
        body: 'Keep it going!',
        tag: 'streak-celebration',
        data: { url: '/dashboard', type: 'streak' },
        email: {
          title: '🔥 You\'re ON FIRE!',
          body: 'Alert! Alert! 🚨 We have a consistency champion in the building! Your streak is so hot, it\'s practically glowing! ✨',
          motivation: 'At this rate, you\'ll be teaching masterclasses on "How to Be Awesome Daily." Keep that momentum rolling! 🎯'
        }
      },
      random: [
        {
          title: '💪 Power Moment!',
          body: 'Quick check: How\'s your MNZD energy today?',
          tag: 'random-motivation',
          data: { url: '/dashboard', type: 'random' },
          email: {
            title: '💪 POWER MOMENT ALERT!',
            body: 'Hey superstar! Just dropping by to remind you that you\'re absolutely crushing it! Every moment is a chance to level up!',
            motivation: 'Small actions, when multiplied by consistency, create extraordinary results! 🚀'
          }
        },
        {
          title: '🎯 Focus Check!',
          body: 'What\'s your next MNZD win going to be?',
          tag: 'random-focus',
          data: { url: '/dashboard', type: 'random' },
          email: {
            title: '🎯 FOCUS CHECKPOINT!',
            body: 'Time for a quick focus check! Your future self is counting on the decisions you make right now. What\'s your next move?',
            motivation: 'Champions aren\'t made in comfort zones. They\'re made in moments like this! 💎'
          }
        },
        {
          title: '⚡ Energy Boost!',
          body: 'Ready to add some spark to your day?',
          tag: 'random-energy',
          data: { url: '/dashboard', type: 'random' },
          email: {
            title: '⚡ ENERGY BOOST INCOMING!',
            body: 'Feeling the afternoon slump? Time to inject some MNZD magic into your day! Your chain is waiting for its next link!',
            motivation: 'Energy flows where attention goes. Focus on your goals and watch the magic happen! ✨'
          }
        },
        {
          title: '🌟 Shine Time!',
          body: 'Your potential is calling. Will you answer?',
          tag: 'random-potential',
          data: { url: '/dashboard', type: 'random' },
          email: {
            title: '🌟 YOUR SHINE TIME IS NOW!',
            body: 'Can you hear that? It\'s your potential calling your name! Every great achievement started with someone saying "I can do this."',
            motivation: 'You have everything within you to succeed. The only question is: will you use it? 🔥'
          }
        },
        {
          title: '🚀 Momentum Check!',
          body: 'How\'s your MNZD momentum feeling today?',
          tag: 'random-momentum',
          data: { url: '/dashboard', type: 'random' },
          email: {
            title: '🚀 MOMENTUM METER CHECK!',
            body: 'Quick momentum check! Are you riding the wave of success or creating it? Either way, you\'re exactly where you need to be!',
            motivation: 'Momentum is built one decision at a time. What\'s your next power move? 💪'
          }
        },
        {
          title: '🎪 Magic Moment!',
          body: 'Time to create some MNZD magic!',
          tag: 'random-magic',
          data: { url: '/dashboard', type: 'random' },
          email: {
            title: '🎪 MAGIC MOMENT ALERT!',
            body: 'Abracadabra! ✨ Time to create some MNZD magic! Every small action is a spell you cast on your future self!',
            motivation: 'The real magic happens when preparation meets opportunity. Are you ready? 🎭'
          }
        }
      ]
    };
  }
}