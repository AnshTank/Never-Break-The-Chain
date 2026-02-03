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
      
      // Get user
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
        
        // Log notification
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
      }
    };
  }
}