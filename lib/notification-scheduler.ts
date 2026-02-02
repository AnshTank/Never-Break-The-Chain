import { connectToDatabase } from './mongodb';
import { HybridNotificationService } from './hybrid-notification-service';
import { ObjectId } from 'mongodb';

export class NotificationScheduler {
  static async setupUserNotifications(userId: string): Promise<void> {
    const { db } = await connectToDatabase();
    const userObjectId = new ObjectId(userId);

    // Get user preferences
    const user = await db.collection('users').findOne({ _id: userObjectId });
    if (!user) return;

    const preferences = user.notificationPreferences || {
      morningReminder: { enabled: true, time: '07:00' },
      eveningReminder: { enabled: true, time: '20:00' },
      missedDayReminder: { enabled: true },
      milestoneAlerts: { enabled: true },
      streakAlerts: { enabled: true }
    };

    // Clear existing scheduled notifications
    await db.collection('scheduled_notifications').deleteMany({
      userId: userObjectId,
      status: 'pending'
    });

    const now = new Date();
    const templates = HybridNotificationService.getNotificationTemplates();

    // Schedule morning reminders
    if (preferences.morningReminder.enabled) {
      const morningTime = this.parseTime(preferences.morningReminder.time);
      const nextMorning = this.getNextScheduleDate(now, morningTime.hours, morningTime.minutes);
      
      await HybridNotificationService.scheduleNotification(
        userId,
        templates.morning,
        nextMorning,
        { type: 'morning', recurring: true }
      );
    }

    // Schedule evening reminders
    if (preferences.eveningReminder.enabled) {
      const eveningTime = this.parseTime(preferences.eveningReminder.time);
      const nextEvening = this.getNextScheduleDate(now, eveningTime.hours, eveningTime.minutes);
      
      await HybridNotificationService.scheduleNotification(
        userId,
        templates.evening,
        nextEvening,
        { type: 'evening', recurring: true }
      );
    }
  }

  static async checkMissedDays(): Promise<void> {
    const { db } = await connectToDatabase();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const endOfYesterday = new Date(yesterday);
    endOfYesterday.setHours(23, 59, 59, 999);

    // Find users who didn't log progress yesterday
    const usersWithProgress = await db.collection('progress').distinct('userId', {
      date: {
        $gte: yesterday,
        $lte: endOfYesterday
      }
    });

    // Get all active users
    const allUsers = await db.collection('users').find({
      isActive: true,
      notificationPreferences: {
        $exists: true
      }
    }).toArray();

    const templates = HybridNotificationService.getNotificationTemplates();

    for (const user of allUsers) {
      const hasProgress = usersWithProgress.some(id => id.equals(user._id));
      const preferences = user.notificationPreferences || {};
      
      if (!hasProgress && preferences.missedDayReminder?.enabled !== false) {
        // Check if we already sent a missed day notification recently
        const recentMissedNotification = await db.collection('notification_logs').findOne({
          userId: user._id,
          type: 'missed_day',
          sentAt: {
            $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        });

        if (!recentMissedNotification) {
          await HybridNotificationService.sendNotification(
            user._id.toString(),
            templates.missed_day,
            { priority: 'normal' }
          );
        }
      }
    }
  }

  static async checkStreaksAndMilestones(): Promise<void> {
    const { db } = await connectToDatabase();
    const templates = HybridNotificationService.getNotificationTemplates();

    // Get users with recent progress
    const recentProgress = await db.collection('progress').aggregate([
      {
        $match: {
          date: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      },
      {
        $group: {
          _id: '$userId',
          progressDays: { $push: '$date' },
          totalHours: { $sum: { $add: ['$meditation', '$nutrition', '$zone', '$discipline'] } }
        }
      }
    ]).toArray();

    for (const userProgress of recentProgress) {
      const userId = userProgress._id.toString();
      const user = await db.collection('users').findOne({ _id: userProgress._id });
      
      if (!user || user.notificationPreferences?.streakAlerts?.enabled === false) continue;

      // Calculate current streak
      const streak = this.calculateStreak(userProgress.progressDays);
      
      // Check for streak milestones (7, 14, 30, 60, 100 days)
      const milestones = [7, 14, 30, 60, 100, 200, 365];
      if (milestones.includes(streak)) {
        // Check if we already celebrated this milestone
        const existingCelebration = await db.collection('notification_logs').findOne({
          userId: userProgress._id,
          type: 'milestone',
          'payload.data.milestone': streak,
          sentAt: {
            $gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        });

        if (!existingCelebration) {
          const milestonePayload = {
            ...templates.milestone,
            title: `🏆 ${streak}-Day Milestone Achieved!`,
            body: `Incredible! You've maintained your MNZD chain for ${streak} days! Your consistency is truly inspiring! 🌟`,
            data: { ...templates.milestone.data, milestone: streak }
          };

          await HybridNotificationService.sendNotification(
            userId,
            milestonePayload,
            { priority: 'high', forceEmail: true }
          );
        }
      }

      // Check for weekly streak celebrations (every 7 days after 14)
      if (streak > 14 && streak % 7 === 0 && !milestones.includes(streak)) {
        const existingStreak = await db.collection('notification_logs').findOne({
          userId: userProgress._id,
          type: 'streak',
          'payload.data.streak': streak,
          sentAt: {
            $gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        });

        if (!existingStreak) {
          const streakPayload = {
            ...templates.streak,
            title: `🔥 ${streak}-Day Streak!`,
            body: `You're on fire! ${streak} consecutive days of MNZD excellence! Keep the momentum going! ⚡`,
            data: { ...templates.streak.data, streak }
          };

          await HybridNotificationService.sendNotification(
            userId,
            streakPayload,
            { priority: 'normal' }
          );
        }
      }
    }
  }

  private static parseTime(timeString: string): { hours: number; minutes: number } {
    const [hours, minutes] = timeString.split(':').map(Number);
    return { hours, minutes };
  }

  private static getNextScheduleDate(from: Date, hours: number, minutes: number): Date {
    const next = new Date(from);
    next.setHours(hours, minutes, 0, 0);
    
    // If the time has already passed today, schedule for tomorrow
    if (next <= from) {
      next.setDate(next.getDate() + 1);
    }
    
    return next;
  }

  private static calculateStreak(progressDays: Date[]): number {
    if (!progressDays.length) return 0;

    // Sort dates in descending order
    const sortedDates = progressDays
      .map(d => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime());

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedDates.length; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      
      const hasProgressOnDate = sortedDates.some(date => {
        const progressDate = new Date(date);
        progressDate.setHours(0, 0, 0, 0);
        return progressDate.getTime() === checkDate.getTime();
      });

      if (hasProgressOnDate) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  // Cron job function to be called periodically
  static async runScheduledTasks(): Promise<void> {
    try {
      console.log('Running scheduled notification tasks...');
      
      // Process scheduled notifications
      await HybridNotificationService.processScheduledNotifications();
      
      // Check for missed days (run once per day)
      const now = new Date();
      if (now.getHours() === 9) { // Run at 9 AM
        await this.checkMissedDays();
      }
      
      // Check streaks and milestones (run twice per day)
      if (now.getHours() === 9 || now.getHours() === 21) {
        await this.checkStreaksAndMilestones();
      }
      
      console.log('Scheduled notification tasks completed');
    } catch (error) {
      console.error('Error running scheduled notification tasks:', error);
    }
  }
}