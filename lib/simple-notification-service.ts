import { connectToDatabase } from './mongodb';
import { sendEmail } from './email-service';
import { ObjectId } from 'mongodb';

export class SimpleNotificationService {
  static async sendNotification(
    userId: string,
    payload: any,
    options: { forceEmail?: boolean; priority?: string } = {}
  ): Promise<boolean> {
    try {
      const { db } = await connectToDatabase();
      const userObjectId = new ObjectId(userId);
      
      const user = await db.collection('users').findOne({ _id: userObjectId });
      if (!user || !user.email) {
        console.error(`❌ User ${userId} not found or no email`);
        return false;
      }

      console.log(`📧 Sending email to: ${user.email}`);
      
      const emailData = payload.email || {};
      const success = await sendEmail({
        to: user.email,
        subject: emailData.title || payload.title,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>${emailData.title || payload.title}</title>
          </head>
          <body style="font-family: Arial, sans-serif; background: #f8fafc; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #1e293b; font-size: 28px; margin: 0;">🔗 Never Break The Chain</h1>
                <p style="color: #64748b; margin: 10px 0 0;">MNZD Habit Tracker</p>
              </div>
              <div style="text-align: center;">
                <h2 style="color: #f59e0b; font-size: 24px; margin: 0 0 20px;">${emailData.title || payload.title}</h2>
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">${emailData.body || payload.body}</p>
                ${emailData.motivation ? `<div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0;"><p style="color: #92400e; margin: 0; font-weight: 600;">💫 ${emailData.motivation}</p></div>` : ''}
                <a href="https://never-break-the-chain.vercel.app/dashboard" style="display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0;">Open Dashboard</a>
              </div>
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <p style="color: #64748b; font-size: 14px; margin: 0;">© 2024 Never Break The Chain by Ansh Tank</p>
              </div>
            </div>
          </body>
          </html>
        `
      });

      if (success) {
        console.log(`✅ Email sent successfully to ${user.email}`);
        
        await db.collection('notification_logs').insertOne({
          userId: userObjectId,
          type: payload.tag || 'general',
          title: payload.title,
          sentAt: new Date(),
          success: true,
          payload
        });
        
        return true;
      } else {
        console.error(`❌ Email failed for ${user.email}`);
        return false;
      }
      
    } catch (error) {
      console.error(`❌ Notification error for user ${userId}:`, error);
      return false;
    }
  }

  static async scheduleNotification(
    userId: string,
    payload: any,
    scheduledFor: Date,
    options: { type: string; recurring?: boolean }
  ): Promise<void> {
    const { db } = await connectToDatabase();
    const userObjectId = new ObjectId(userId);

    await db.collection('scheduled_notifications').insertOne({
      userId: userObjectId,
      payload,
      scheduledFor,
      type: options.type,
      recurring: options.recurring || false,
      status: 'pending',
      createdAt: new Date()
    });
  }

  static getNotificationTemplates() {
    return {
      morning: {
        title: '🌅 Good Morning!',
        body: 'Time to build your chain!',
        tag: 'morning-reminder',
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
        data: {},
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
        data: {},
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
          email: {
            title: '🎯 FOCUS CHECKPOINT!',
            body: 'Time for a quick focus check! Your future self is counting on the decisions you make right now. What\'s your next move?',
            motivation: 'Champions aren\'t made in comfort zones. They\'re made in moments like this! 💎'
          }
        }
      ]
    };
  }
}