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
      randomReminders: { enabled: true, frequency: 2 }, // 2 random per day
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

    // Schedule random reminders
    if (preferences.randomReminders?.enabled) {
      await this.scheduleRandomReminders(userId, preferences.randomReminders.frequency || 2);
    }
  }

  // Schedule random reminders for a user
  static async scheduleRandomReminders(userId: string, frequency: number = 2): Promise<void> {
    const templates = HybridNotificationService.getNotificationTemplates();
    const now = new Date();
    
    // Generate random times for today and tomorrow
    for (let day = 0; day < 2; day++) {
      for (let i = 0; i < frequency; i++) {
        const randomTime = this.generateRandomTime();
        const scheduleDate = new Date(now);
        scheduleDate.setDate(scheduleDate.getDate() + day);
        scheduleDate.setHours(randomTime.hours, randomTime.minutes, 0, 0);
        
        // Only schedule if time is in the future
        if (scheduleDate > now) {
          const randomTemplate = this.getRandomMotivationTemplate();
          await HybridNotificationService.scheduleNotification(
            userId,
            randomTemplate,
            scheduleDate,
            { type: 'random', recurring: false }
          );
        }
      }
    }
  }

  // Generate random time between 9 AM and 9 PM
  private static generateRandomTime(): { hours: number; minutes: number } {
    const hours = Math.floor(Math.random() * 12) + 9; // 9 AM to 8 PM
    const minutes = Math.floor(Math.random() * 60);
    return { hours, minutes };
  }

  // Get random motivational template
  private static getRandomMotivationTemplate(): any {
    const templates = HybridNotificationService.getNotificationTemplates();
    const randomTemplates = templates.random;
    const randomIndex = Math.floor(Math.random() * randomTemplates.length);
    return randomTemplates[randomIndex];
  }

  // Enhanced milestone checking with more granular milestones
  static async checkAdvancedMilestones(): Promise<void> {
    const { db } = await connectToDatabase();
    const templates = HybridNotificationService.getNotificationTemplates();

    // Get users with recent progress
    const recentProgress = await db.collection('progress').aggregate([
      {
        $match: {
          date: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      },
      {
        $group: {
          _id: '$userId',
          progressDays: { $push: '$date' },
          totalHours: { $sum: { $add: ['$meditation', '$nutrition', '$zone', '$discipline'] } },
          avgDaily: { $avg: { $add: ['$meditation', '$nutrition', '$zone', '$discipline'] } }
        }
      }
    ]).toArray();

    for (const userProgress of recentProgress) {
      const userId = userProgress._id.toString();
      const user = await db.collection('users').findOne({ _id: userProgress._id });
      
      if (!user || user.notificationPreferences?.milestoneAlerts?.enabled === false) continue;

      const streak = this.calculateStreak(userProgress.progressDays);
      const totalHours = userProgress.totalHours;
      
      // Check streak milestones
      const streakMilestones = [3, 7, 14, 21, 30, 50, 75, 100, 150, 200, 365, 500, 1000];
      if (streakMilestones.includes(streak)) {
        await this.sendMilestoneNotification(userId, 'streak', streak, templates);
      }
      
      // Check hour milestones
      const hourMilestones = [10, 25, 50, 100, 200, 500, 1000];
      const hourMilestone = hourMilestones.find(m => totalHours >= m && totalHours < m + 5);
      if (hourMilestone) {
        await this.sendMilestoneNotification(userId, 'hours', hourMilestone, templates);
      }
      
      // Check consistency milestones (percentage of days in last 30)
      const consistencyRate = (userProgress.progressDays.length / 30) * 100;
      if (consistencyRate >= 90 && consistencyRate < 95) {
        await this.sendMilestoneNotification(userId, 'consistency', 90, templates);
      } else if (consistencyRate >= 95) {
        await this.sendMilestoneNotification(userId, 'consistency', 95, templates);
      }
    }
  }

  private static async sendMilestoneNotification(
    userId: string, 
    type: 'streak' | 'hours' | 'consistency', 
    value: number, 
    templates: any
  ): Promise<void> {
    const { db } = await connectToDatabase();
    
    // Check if already sent
    const existing = await db.collection('notification_logs').findOne({
      userId: new ObjectId(userId),
      type: `milestone_${type}`,
      'payload.data.value': value,
      sentAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    
    if (existing) return;
    
    let template;
    switch (type) {
      case 'streak':
        template = {
          ...templates.milestone,
          title: `🔥 ${value}-Day Streak Milestone!`,
          body: `Incredible! ${value} consecutive days of excellence!`,
          email: {
            title: `🔥 STREAK LEGEND: ${value} Days!`,
            body: `You absolute legend! ${value} consecutive days of MNZD mastery! You're not just building habits, you're building a legacy!`,
            motivation: `At this rate, you'll be writing books about consistency! Keep that fire burning! 🚀`
          },
          data: { ...templates.milestone.data, type: 'streak', value }
        };
        break;
      case 'hours':
        template = {
          ...templates.milestone,
          title: `⏰ ${value} Hours Milestone!`,
          body: `Amazing! You've invested ${value} hours in yourself!`,
          email: {
            title: `⏰ TIME INVESTMENT CHAMPION: ${value} Hours!`,
            body: `WOW! You've invested ${value} precious hours into becoming the best version of yourself! That's dedication that pays dividends!`,
            motivation: `Time is the most valuable currency, and you're spending it like a millionaire! 💎`
          },
          data: { ...templates.milestone.data, type: 'hours', value }
        };
        break;
      case 'consistency':
        template = {
          ...templates.milestone,
          title: `📊 ${value}% Consistency Master!`,
          body: `Outstanding! ${value}% consistency rate achieved!`,
          email: {
            title: `📊 CONSISTENCY CHAMPION: ${value}%!`,
            body: `Mind-blowing! You've achieved ${value}% consistency! You're basically a habit-building superhero at this point!`,
            motivation: `Consistency is the mother of mastery, and you're proving it every single day! 🏆`
          },
          data: { ...templates.milestone.data, type: 'consistency', value }
        };
        break;
    }
    
    await HybridNotificationService.sendNotification(
      userId,
      template,
      { priority: 'high', forceEmail: true }
    );
  }
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
      console.log('🕐 Running scheduled notification tasks...');
      
      // Process scheduled notifications
      await HybridNotificationService.processScheduledNotifications();
      
      const now = new Date();
      const hour = now.getHours();
      
      // Check for missed days (run once per day at 9 AM)
      if (hour === 9) {
        await this.checkMissedDays();
      }
      
      // Check streaks and milestones (run 3 times per day)
      if (hour === 9 || hour === 15 || hour === 21) {
        await this.checkStreaksAndMilestones();
        await this.checkAdvancedMilestones();
      }
      
      // Schedule new random reminders (run twice per day)
      if (hour === 6 || hour === 18) {
        await this.scheduleRandomRemindersForAllUsers();
      }
      
      console.log('✅ Scheduled notification tasks completed');
    } catch (error) {
      console.error('❌ Error running scheduled notification tasks:', error);
    }
  }

  // Schedule random reminders for all active users
  private static async scheduleRandomRemindersForAllUsers(): Promise<void> {
    const { db } = await connectToDatabase();
    
    const activeUsers = await db.collection('users').find({
      isActive: true,
      'notificationPreferences.randomReminders.enabled': { $ne: false }
    }).toArray();
    
    for (const user of activeUsers) {
      const frequency = user.notificationPreferences?.randomReminders?.frequency || 2;
      await this.scheduleRandomReminders(user._id.toString(), frequency);
    }
    
    console.log(`📱 Scheduled random reminders for ${activeUsers.length} users`);
  }