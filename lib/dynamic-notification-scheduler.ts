import { connectToDatabase } from './mongodb';
import { ObjectId } from 'mongodb';
import { 
  sendMorningMotivationEmail,
  sendEveningCheckinEmail,
  sendMilestoneEmail,
  sendStreakRecoveryEmail,
  sendWeeklySummaryEmail,
  sendEmail
} from './email-service';
import { aiContentService } from './ai-content-service';

// Notification types and their scheduling
export enum NotificationType {
  MORNING_MOTIVATION = 'morning_motivation',
  EVENING_CHECKIN = 'evening_checkin',
  MILESTONE_CELEBRATION = 'milestone_celebration',
  STREAK_RECOVERY = 'streak_recovery',
  WEEKLY_SUMMARY = 'weekly_summary',
  RANDOM_MOTIVATION = 'random_motivation',
  INACTIVE_USER = 'inactive_user',
  COMEBACK_ENCOURAGEMENT = 'comeback_encouragement'
}

// User progress interface
interface UserProgress {
  userId: string;
  name: string;
  email: string;
  currentStreak: number;
  longestStreak: number;
  lastActivity: Date;
  completedToday: number;
  totalHabits: number;
  weeklyCompletion: number;
  monthlyCompletion: number;
  joinDate: Date;
  preferences: {
    morningTime?: string;
    eveningTime?: string;
    timezone?: string;
    emailNotifications: boolean;
  };
  habitStats: {
    meditation: { completed: number; total: number };
    nutrition: { completed: number; total: number };
    zone: { completed: number; total: number };
    discipline: { completed: number; total: number };
  };
}

// Dynamic content generation (will be enhanced with AI)
export class DynamicContentGenerator {
  
  // Generate personalized morning motivation with AI
  static async generateMorningMotivation(user: UserProgress): Promise<{
    subject: string;
    message: string;
    focusArea: string;
  }> {
    const context = {
      name: user.name,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      completionRate: user.weeklyCompletion,
      weakestHabit: this.getWeakestHabit(user),
      strongestHabit: this.getStrongestHabit(user),
      daysSinceJoin: Math.floor((new Date().getTime() - user.joinDate.getTime()) / (1000 * 60 * 60 * 24)),
      timeOfDay: 'morning' as const,
      lastActivity: user.lastActivity
    };

    return await aiContentService.generateMorningMotivation(context);
  }

  // Generate personalized evening check-in
  static generateEveningCheckin(user: UserProgress): {
    subject: string;
    message: string;
    reflection: string;
  } {
    const completionRate = user.totalHabits > 0 ? (user.completedToday / user.totalHabits) * 100 : 0;
    
    const messages = [
      {
        condition: completionRate === 100,
        subject: `🎉 Perfect Day Complete - ${user.name}!`,
        message: `Incredible work today! You completed all ${user.totalHabits} habits. This is how legends are made!`,
        reflection: 'Celebrate this victory and prepare for tomorrow\'s success.'
      },
      {
        condition: completionRate >= 75,
        subject: `💪 Strong Day - ${Math.round(completionRate)}% Complete`,
        message: `Great job ${user.name}! You completed ${user.completedToday} out of ${user.totalHabits} habits today. You're building something amazing!`,
        reflection: 'Reflect on what worked well and how to finish even stronger tomorrow.'
      },
      {
        condition: completionRate >= 50,
        subject: `📈 Progress Made - Keep Building`,
        message: `Hey ${user.name}, you made solid progress today with ${user.completedToday} habits completed. Every step counts!`,
        reflection: 'Consider what you can adjust tomorrow to hit your full potential.'
      },
      {
        condition: true, // Default
        subject: `🌱 Tomorrow is a New Opportunity`,
        message: `${user.name}, today might not have gone as planned, but tomorrow is a fresh start. Your journey continues!`,
        reflection: 'Use today\'s experience as fuel for tomorrow\'s success.'
      }
    ];

    return messages.find(m => m.condition) || messages[messages.length - 1];
  }

  // Generate milestone celebration content
  static generateMilestoneContent(user: UserProgress): {
    subject: string;
    message: string;
    achievement: string;
    nextGoal: string;
  } {
    const milestones = [
      { days: 365, title: 'LEGENDARY', emoji: '👑', message: 'You\'ve achieved the impossible!' },
      { days: 100, title: 'CENTURION', emoji: '💯', message: 'You\'ve joined the elite 100-day club!' },
      { days: 60, title: 'CHAMPION', emoji: '🏆', message: 'Two months of pure dedication!' },
      { days: 30, title: 'WARRIOR', emoji: '⚔️', message: 'One month of unstoppable momentum!' },
      { days: 21, title: 'HABIT MASTER', emoji: '🎯', message: 'You\'ve mastered the 21-day rule!' },
      { days: 14, title: 'STRONG', emoji: '💪', message: 'Two weeks of consistent growth!' },
      { days: 7, title: 'COMMITTED', emoji: '🔥', message: 'Your first week is complete!' },
      { days: 3, title: 'STARTER', emoji: '🌱', message: 'Three days of building momentum!' }
    ];

    const milestone = milestones.find(m => m.days === user.currentStreak) || 
                     milestones[milestones.length - 1];
    
    const nextMilestone = milestones.find(m => m.days > user.currentStreak) || 
                         { days: user.currentStreak + 30, title: 'LEGEND', emoji: '🌟' };

    return {
      subject: `${milestone.emoji} ${user.currentStreak} Days - ${milestone.title} Status Achieved!`,
      message: `${user.name}, ${milestone.message} Your ${user.currentStreak}-day streak is a testament to your commitment to the MNZD methodology!`,
      achievement: `${milestone.title} - ${user.currentStreak} Days`,
      nextGoal: `Next milestone: ${nextMilestone.title} at ${nextMilestone.days} days`
    };
  }

  // Generate weekly summary with insights
  static generateWeeklySummary(user: UserProgress, weeklyData: any): {
    subject: string;
    insights: string[];
    recommendations: string[];
    nextWeekGoals: string[];
  } {
    const completionRate = weeklyData.completionRate || 0;
    const topHabit = this.getStrongestHabit(user);
    const weakestHabit = this.getWeakestHabit(user);

    const insights = [
      `This week you maintained a ${completionRate}% completion rate`,
      `Your strongest area: ${topHabit} - keep this momentum!`,
      `Growth opportunity: ${weakestHabit} - let's focus here`,
      `Current streak: ${user.currentStreak} days (${user.currentStreak > user.longestStreak ? 'New record!' : `${user.longestStreak - user.currentStreak} days from your best`})`
    ];

    const recommendations = this.generatePersonalizedRecommendations(user, weeklyData);
    const nextWeekGoals = this.generateNextWeekGoals(user, weeklyData);

    return {
      subject: `📊 Week ${this.getWeekNumber()} Summary - Your MNZD Journey`,
      insights,
      recommendations,
      nextWeekGoals
    };
  }

  // Generate comeback encouragement for inactive users
  static generateComebackMessage(user: UserProgress, daysSinceLastActivity: number): {
    subject: string;
    message: string;
    motivation: string;
  } {
    const messages = [
      {
        condition: daysSinceLastActivity >= 30,
        subject: `🌟 We Miss You ${user.name} - Your Journey Awaits`,
        message: `It's been ${daysSinceLastActivity} days since your last visit. Your ${user.longestStreak}-day streak shows what you're capable of!`,
        motivation: 'Every master was once a disaster. Every pro was once an amateur. Come back stronger!'
      },
      {
        condition: daysSinceLastActivity >= 7,
        subject: `🔄 Ready for a Fresh Start ${user.name}?`,
        message: `A week away can sometimes be exactly what we need. Your previous ${user.longestStreak}-day streak is proof of your potential!`,
        motivation: 'The best time to plant a tree was 20 years ago. The second best time is now.'
      },
      {
        condition: daysSinceLastActivity >= 3,
        subject: `💪 Bounce Back Time - ${user.name}!`,
        message: `${daysSinceLastActivity} days is just a pause, not a stop. Champions get back up!`,
        motivation: 'Your comeback story starts with a single step. Take it today!'
      }
    ];

    return messages.find(m => m.condition) || messages[messages.length - 1];
  }

  // Helper methods
  private static getWeakestHabit(user: UserProgress): string {
    const habits = user.habitStats;
    let weakest = 'Meditation';
    let lowestRate = 1;

    Object.entries(habits).forEach(([habit, stats]) => {
      const rate = stats.total > 0 ? stats.completed / stats.total : 0;
      if (rate < lowestRate) {
        lowestRate = rate;
        weakest = habit.charAt(0).toUpperCase() + habit.slice(1);
      }
    });

    return weakest;
  }

  private static getStrongestHabit(user: UserProgress): string {
    const habits = user.habitStats;
    let strongest = 'Meditation';
    let highestRate = 0;

    Object.entries(habits).forEach(([habit, stats]) => {
      const rate = stats.total > 0 ? stats.completed / stats.total : 0;
      if (rate > highestRate) {
        highestRate = rate;
        strongest = habit.charAt(0).toUpperCase() + habit.slice(1);
      }
    });

    return strongest;
  }

  private static generatePersonalizedRecommendations(user: UserProgress, weeklyData: any): string[] {
    const recommendations = [];
    const weakestHabit = this.getWeakestHabit(user).toLowerCase();

    // Habit-specific recommendations
    const habitRecommendations = {
      meditation: [
        'Try starting with just 5 minutes of mindfulness',
        'Use guided meditation apps like Headspace or Calm',
        'Practice breathing exercises during breaks'
      ],
      nutrition: [
        'Meal prep on Sundays for the week ahead',
        'Keep healthy snacks readily available',
        'Track your water intake alongside meals'
      ],
      zone: [
        'Schedule workouts like important meetings',
        'Try the 7-minute workout for busy days',
        'Take walking meetings when possible'
      ],
      discipline: [
        'Use the Pomodoro Technique for focused work',
        'Eliminate distractions during deep work sessions',
        'Set specific learning goals for each day'
      ]
    };

    if (habitRecommendations[weakestHabit as keyof typeof habitRecommendations]) {
      recommendations.push(...habitRecommendations[weakestHabit as keyof typeof habitRecommendations].slice(0, 2));
    }

    // General recommendations based on performance
    if (weeklyData.completionRate < 50) {
      recommendations.push('Start smaller - focus on consistency over perfection');
    } else if (weeklyData.completionRate > 80) {
      recommendations.push('Consider adding a new challenge to your routine');
    }

    return recommendations;
  }

  private static generateNextWeekGoals(user: UserProgress, weeklyData: any): string[] {
    const goals = [];
    const currentRate = weeklyData.completionRate || 0;
    const targetRate = Math.min(currentRate + 15, 100);

    goals.push(`Achieve ${targetRate}% completion rate`);
    goals.push(`Focus on improving ${this.getWeakestHabit(user)}`);
    
    if (user.currentStreak > 0) {
      goals.push(`Extend your streak to ${user.currentStreak + 7} days`);
    } else {
      goals.push('Start a new 7-day streak');
    }

    return goals;
  }

  private static getWeekNumber(): number {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
  }
}

// Enhanced notification scheduler
export class EnhancedNotificationScheduler {
  
  // Main scheduling function called by cron
  static async scheduleNotifications(): Promise<{
    sent: number;
    failed: number;
    types: Record<string, number>;
  }> {
    const results = {
      sent: 0,
      failed: 0,
      types: {} as Record<string, number>
    };

    try {
      const { db } = await connectToDatabase();
      const users = await this.getEligibleUsers(db);
      
      console.log(`📧 Processing notifications for ${users.length} users`);

      for (const user of users) {
        const notifications = await this.determineNotificationsForUser(user);
        
        for (const notification of notifications) {
          try {
            const success = await this.sendNotification(user, notification);
            if (success) {
              results.sent++;
              results.types[notification.type] = (results.types[notification.type] || 0) + 1;
              
              // Log notification sent
              await this.logNotification(db, user.userId, notification.type, true);
            } else {
              results.failed++;
            }
          } catch (error) {
            console.error(`Failed to send ${notification.type} to ${user.email}:`, error);
            results.failed++;
          }
        }
      }

      console.log(`✅ Notification batch complete: ${results.sent} sent, ${results.failed} failed`);
      return results;

    } catch (error) {
      console.error('❌ Error in notification scheduler:', error);
      throw error;
    }
  }

  // Get users eligible for notifications
  private static async getEligibleUsers(db: any): Promise<UserProgress[]> {
    const users = await db.collection('users').find({
      email: { $exists: true, $nin: [null, ''] },
      emailNotifications: { $ne: false }
    }).toArray();

    const userProgressList: UserProgress[] = [];

    for (const user of users) {
      // Get user's progress data
      const progress = await db.collection('progress').findOne({ userId: user._id });
      const habits = await db.collection('habits').find({ userId: user._id }).toArray();
      
      // Calculate current streak and stats
      const userProgress: UserProgress = {
        userId: user._id.toString(),
        name: user.name || 'Friend',
        email: user.email,
        currentStreak: progress?.currentStreak || 0,
        longestStreak: progress?.longestStreak || 0,
        lastActivity: progress?.lastActivity || new Date(),
        completedToday: this.calculateCompletedToday(habits),
        totalHabits: 4, // MNZD methodology
        weeklyCompletion: this.calculateWeeklyCompletion(habits),
        monthlyCompletion: this.calculateMonthlyCompletion(habits),
        joinDate: user.createdAt || new Date(),
        preferences: {
          morningTime: user.preferences?.morningTime || '07:00',
          eveningTime: user.preferences?.eveningTime || '20:00',
          timezone: user.preferences?.timezone || 'UTC',
          emailNotifications: user.emailNotifications !== false
        },
        habitStats: this.calculateHabitStats(habits)
      };

      userProgressList.push(userProgress);
    }

    return userProgressList;
  }

  // Determine which notifications to send to a user
  private static async determineNotificationsForUser(user: UserProgress): Promise<Array<{
    type: NotificationType;
    priority: number;
    scheduledTime?: Date;
  }>> {
    const notifications = [];
    const now = new Date();
    const hour = now.getHours();
    const daysSinceLastActivity = Math.floor((now.getTime() - user.lastActivity.getTime()) / (1000 * 60 * 60 * 24));

    // Morning motivation (7-9 AM)
    if (hour >= 7 && hour <= 9) {
      notifications.push({
        type: NotificationType.MORNING_MOTIVATION,
        priority: 1
      });
    }

    // Evening check-in (8-10 PM)
    if (hour >= 20 && hour <= 22) {
      notifications.push({
        type: NotificationType.EVENING_CHECKIN,
        priority: 1
      });
    }

    // Milestone celebrations (medically-proven intervals)
    const milestones = [3, 7, 14, 21, 30, 45, 66, 90, 120, 180, 240, 300, 366];
    if (milestones.includes(user.currentStreak)) {
      notifications.push({
        type: NotificationType.MILESTONE_CELEBRATION,
        priority: 0 // Highest priority
      });
    }

    // Streak recovery (user broke streak)
    if (user.currentStreak === 0 && user.longestStreak > 0 && daysSinceLastActivity <= 3) {
      notifications.push({
        type: NotificationType.STREAK_RECOVERY,
        priority: 1
      });
    }

    // Weekly summary (Mondays)
    if (now.getDay() === 1 && hour >= 9 && hour <= 11) {
      notifications.push({
        type: NotificationType.WEEKLY_SUMMARY,
        priority: 2
      });
    }

    // Inactive user comeback (3+ days inactive)
    if (daysSinceLastActivity >= 3) {
      notifications.push({
        type: NotificationType.COMEBACK_ENCOURAGEMENT,
        priority: 2
      });
    }

    // Random motivation (12-2 PM, 3-5 PM)
    if ((hour >= 12 && hour <= 14) || (hour >= 15 && hour <= 17)) {
      if (Math.random() < 0.3) { // 30% chance
        notifications.push({
          type: NotificationType.RANDOM_MOTIVATION,
          priority: 3
        });
      }
    }

    // Sort by priority and return top 2 to avoid spam
    return notifications
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 2);
  }

  // Send individual notification
  private static async sendNotification(user: UserProgress, notification: {
    type: NotificationType;
    priority: number;
  }): Promise<boolean> {
    
    switch (notification.type) {
      case NotificationType.MORNING_MOTIVATION:
        const morningContent = await DynamicContentGenerator.generateMorningMotivation(user);
        return await sendMorningMotivationEmail(
          user.name,
          user.email,
          user.currentStreak,
          morningContent.message
        );

      case NotificationType.EVENING_CHECKIN:
        return await sendEveningCheckinEmail(
          user.name,
          user.email,
          user.completedToday,
          user.totalHabits
        );

      case NotificationType.MILESTONE_CELEBRATION:
        return await sendMilestoneEmail(
          user.name,
          user.email,
          user.currentStreak
        );

      case NotificationType.STREAK_RECOVERY:
        return await sendStreakRecoveryEmail(
          user.name,
          user.email
        );

      case NotificationType.WEEKLY_SUMMARY:
        const weeklyStats = {
          daysCompleted: Math.floor(user.weeklyCompletion * 7),
          totalDays: 7,
          topHabit: DynamicContentGenerator['getStrongestHabit'](user),
          improvementArea: DynamicContentGenerator['getWeakestHabit'](user)
        };
        return await sendWeeklySummaryEmail(user.name, user.email, weeklyStats);

      case NotificationType.COMEBACK_ENCOURAGEMENT:
        const daysSinceLastActivity = Math.floor((new Date().getTime() - user.lastActivity.getTime()) / (1000 * 60 * 60 * 24));
        const comebackContent = DynamicContentGenerator.generateComebackMessage(user, daysSinceLastActivity);
        return await sendEmail({
          to: user.email,
          subject: comebackContent.subject,
          html: this.generateComebackEmailHTML(user, comebackContent)
        });

      case NotificationType.RANDOM_MOTIVATION:
        return await this.sendRandomMotivation(user);

      default:
        console.warn(`Unknown notification type: ${notification.type}`);
        return false;
    }
  }

  // Generate comeback email HTML
  private static generateComebackEmailHTML(user: UserProgress, content: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${content.subject}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">🌟 Welcome Back!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Your journey continues...</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1e293b; margin: 0 0 20px; font-size: 24px;">Hi ${user.name}! 👋</h2>
            <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">${content.message}</p>
            
            <div style="background: #f0fdf4; border: 2px solid #10b981; border-radius: 12px; padding: 24px; margin: 30px 0;">
              <h3 style="color: #065f46; margin: 0 0 16px; font-size: 18px;">💪 Your Strength</h3>
              <p style="color: #065f46; margin: 0; font-size: 14px;">${content.motivation}</p>
            </div>
            
            <!-- CTA -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://never-break-the-chain.vercel.app/dashboard" 
                 style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                🔗 Continue Your Journey
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; margin: 0; font-size: 12px;">
              © 2026 Never Break The Chain by Ansh Tank. Your comeback story starts now! 🚀
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Send random motivation
  private static async sendRandomMotivation(user: UserProgress): Promise<boolean> {
    const motivations = [
      {
        subject: '💪 Midday Power-Up!',
        message: `${user.name}, you're ${user.currentStreak} days strong! Keep that energy flowing through the rest of your day.`
      },
      {
        subject: '🎯 Focus Check!',
        message: `Hey ${user.name}! Quick reminder: small consistent actions create extraordinary results. You're building something amazing!`
      },
      {
        subject: '🌟 You\'re Doing Great!',
        message: `${user.name}, your commitment to MNZD is inspiring. Every habit you build today shapes who you become tomorrow.`
      }
    ];

    const randomMotivation = motivations[Math.floor(Math.random() * motivations.length)];
    
    return await sendEmail({
      to: user.email,
      subject: randomMotivation.subject,
      html: this.generateSimpleMotivationHTML(user, randomMotivation)
    });
  }

  // Generate simple motivation HTML
  private static generateSimpleMotivationHTML(user: UserProgress, content: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${content.subject}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px;">
        <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">Quick Motivation ⚡</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px;">
            <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">${content.message}</p>
            
            <div style="text-align: center;">
              <a href="https://never-break-the-chain.vercel.app/dashboard" 
                 style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                View Dashboard
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; margin: 0; font-size: 12px;">
              © 2026 Never Break The Chain - Keep building! 🔗
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Helper methods for calculating user stats
  private static calculateCompletedToday(habits: any[]): number {
    const today = new Date().toDateString();
    return habits.filter(habit => 
      habit.completedDates && 
      habit.completedDates.some((date: string) => new Date(date).toDateString() === today)
    ).length;
  }

  private static calculateWeeklyCompletion(habits: any[]): number {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    let totalPossible = habits.length * 7;
    let totalCompleted = 0;

    habits.forEach(habit => {
      if (habit.completedDates) {
        totalCompleted += habit.completedDates.filter((date: string) => 
          new Date(date) >= weekAgo
        ).length;
      }
    });

    return totalPossible > 0 ? totalCompleted / totalPossible : 0;
  }

  private static calculateMonthlyCompletion(habits: any[]): number {
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    
    let totalPossible = habits.length * 30;
    let totalCompleted = 0;

    habits.forEach(habit => {
      if (habit.completedDates) {
        totalCompleted += habit.completedDates.filter((date: string) => 
          new Date(date) >= monthAgo
        ).length;
      }
    });

    return totalPossible > 0 ? totalCompleted / totalPossible : 0;
  }

  private static calculateHabitStats(habits: any[]): UserProgress['habitStats'] {
    const stats = {
      meditation: { completed: 0, total: 0 },
      nutrition: { completed: 0, total: 0 },
      zone: { completed: 0, total: 0 },
      discipline: { completed: 0, total: 0 }
    };

    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);

    habits.forEach(habit => {
      const category = habit.category?.toLowerCase() || 'meditation';
      if (stats[category as keyof typeof stats]) {
        stats[category as keyof typeof stats].total += 30; // 30 days
        if (habit.completedDates) {
          stats[category as keyof typeof stats].completed += habit.completedDates.filter((date: string) => 
            new Date(date) >= monthAgo
          ).length;
        }
      }
    });

    return stats;
  }

  // Log notification sent
  private static async logNotification(db: any, userId: string, type: string, success: boolean): Promise<void> {
    try {
      await db.collection('notification_logs').insertOne({
        userId: new ObjectId(userId),
        type,
        success,
        sentAt: new Date(),
        channel: 'email'
      });
    } catch (error) {
      console.error('Failed to log notification:', error);
    }
  }
}