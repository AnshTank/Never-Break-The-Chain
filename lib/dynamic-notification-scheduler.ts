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
    [key: string]: { completed: number; total: number; name: string };
  };
  mnzdConfigs?: Array<{
    id: string;
    name: string;
    description: string;
    minMinutes: number;
    color?: string;
  }>;
}

// Dynamic content generation (will be enhanced with AI)
export class DynamicContentGenerator {
  
  // Generate personalized morning motivation with AI
  static async generateMorningMotivation(context: {
    name: string;
    currentStreak: number;
    longestStreak: number;
    completionRate: number;
    weakestHabit: string;
    strongestHabit: string;
    daysSinceJoin: number;
    timeOfDay: 'morning';
    lastActivity: Date;
    mnzdHabits?: Array<{
      id: string;
      name: string;
      description: string;
      completed: number;
      total: number;
      rate: number;
    }>;
    todayCompleted?: number;
    totalHabits?: number;
  }): Promise<{
    subject: string;
    message: string;
    focusArea: string;
  }> {
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
    let weakest = user.mnzdConfigs?.[0]?.name || 'Meditation';
    let lowestRate = 1;

    Object.entries(habits).forEach(([habitId, stats]) => {
      const rate = stats.total > 0 ? stats.completed / stats.total : 0;
      if (rate < lowestRate) {
        lowestRate = rate;
        weakest = stats.name || habitId;
      }
    });

    return weakest;
  }

  private static getStrongestHabit(user: UserProgress): string {
    const habits = user.habitStats;
    let strongest = user.mnzdConfigs?.[0]?.name || 'Meditation';
    let highestRate = 0;

    Object.entries(habits).forEach(([habitId, stats]) => {
      const rate = stats.total > 0 ? stats.completed / stats.total : 0;
      if (rate > highestRate) {
        highestRate = rate;
        strongest = stats.name || habitId;
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
  static async scheduleNotifications(options?: {
    window?: 'auto' | 'morning' | 'evening' | 'weekly' | 'all';
    now?: Date;
    dryRun?: boolean;
  }): Promise<{
    sent: number;
    failed: number;
    types: Record<string, number>;
    skipped: number;
    eligibleUsers: number;
    window: 'auto' | 'morning' | 'evening' | 'weekly' | 'all';
    nowIso: string;
  }> {
    const window = options?.window ?? 'auto';
    const now = options?.now ?? new Date();
    const dryRun = options?.dryRun ?? false;

    const results = {
      sent: 0,
      failed: 0,
      types: {} as Record<string, number>,
      skipped: 0,
      eligibleUsers: 0,
      window,
      nowIso: now.toISOString()
    };

    try {
      const { db } = await connectToDatabase();
      const users = await this.getEligibleUsers(db);
      results.eligibleUsers = users.length;
      
      console.log(`📧 Processing notifications for ${users.length} users`);

      for (const user of users) {
        const notifications = await this.determineNotificationsForUser(user, { now, window });
        
        for (const notification of notifications) {
          try {
            const shouldSkip = await this.wasNotificationSentRecently(db, user.userId, notification.type, now, window);
            if (shouldSkip) {
              results.skipped++;
              continue;
            }

            if (dryRun) {
              results.types[notification.type] = (results.types[notification.type] || 0) + 1;
              continue;
            }

            const success = await this.sendNotification(user, notification);
            if (success) {
              results.sent++;
              results.types[notification.type] = (results.types[notification.type] || 0) + 1;
              
              // Log notification sent
              await this.logNotification(db, user.userId, notification.type, true);
            } else {
              results.failed++;
              await this.logNotification(db, user.userId, notification.type, false);
            }
          } catch (error) {
            console.error(`Failed to send ${notification.type} to ${user.email}:`, error);
            results.failed++;
            try {
              await this.logNotification(db, user.userId, notification.type, false);
            } catch {
              // ignore logging failure
            }
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

  // Generate AI-powered evening email HTML with user's custom MNZD names
  private static generateAIEveningEmailHTML(user: UserProgress, content?: any): string {
    const completionRate = user.totalHabits > 0 ? Math.round((user.completedToday / user.totalHabits) * 100) : 0;
    
    const mnzdHabits = user.mnzdConfigs || [
      { id: 'meditation', name: 'Meditation', color: '#8b5cf6' },
      { id: 'nutrition', name: 'Nutrition', color: '#06b6d4' },
      { id: 'zone', name: 'Zone', color: '#f59e0b' },
      { id: 'discipline', name: 'Discipline', color: '#10b981' }
    ];
    
    // Use AI-generated message or fallback
    const encouragementMessage = content?.message || (
      completionRate >= 80 
        ? "Outstanding work today! You're building incredible momentum!" 
        : completionRate >= 50 
        ? "Good progress! Every step counts toward your transformation!" 
        : "Tomorrow is a fresh start! Small steps lead to big changes!"
    );

    const habitCards = mnzdHabits.map(habit => `
      <div style="background: ${habit.color || '#8b5cf6'}15; border: 1px solid ${habit.color || '#8b5cf6'}40; border-radius: 6px; padding: 8px; text-align: center; margin: 2px;">
        <div style="color: ${habit.color || '#8b5cf6'}; font-size: 13px; font-weight: 600;">${habit.name}</div>
      </div>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Evening Check-in</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 12px;">
        <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 16px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 18px; font-weight: 700;">Evening Check-in</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 4px 0 0; font-size: 12px;">Never Break The Chain</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 16px;">
            <h2 style="color: #1e293b; margin: 0 0 12px; font-size: 16px;">Hi ${user.name}!</h2>
            
            <!-- Progress Display -->
            <div style="background: #f0f9ff; border: 1px solid #6366f1; border-radius: 8px; padding: 12px; margin: 12px 0; text-align: center;">
              <div style="font-size: 24px; font-weight: 800; color: #4f46e5; margin-bottom: 2px;">
                ${completionRate}%
              </div>
              <p style="color: #4338ca; margin: 0; font-size: 12px; font-weight: 600;">
                Today's Progress
              </p>
              <p style="color: #6366f1; margin: 4px 0 0; font-size: 11px;">
                ${user.completedToday} of ${user.totalHabits} habits completed
              </p>
            </div>
            
            <!-- Encouragement -->
            <div style="background: ${completionRate >= 80 ? '#f0fdf4' : completionRate >= 50 ? '#fef3c7' : '#fef2f2'}; border-left: 3px solid ${completionRate >= 80 ? '#10b981' : completionRate >= 50 ? '#f59e0b' : '#ef4444'}; border-radius: 6px; padding: 12px; margin: 12px 0;">
              <p style="color: ${completionRate >= 80 ? '#065f46' : completionRate >= 50 ? '#92400e' : '#991b1b'}; margin: 0; font-size: 14px; line-height: 1.4;">
                ${encouragementMessage}
              </p>
            </div>
            
            <!-- Custom MNZD Habits -->
            <div style="margin: 16px 0;">
              <h3 style="color: #1e293b; margin: 0 0 8px; font-size: 14px; font-weight: 600; text-align: center;">
                Your Focus Areas
              </h3>
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px;">
                ${habitCards}
              </div>
            </div>
            
            <!-- CTA -->
            <div style="text-align: center; margin: 16px 0;">
              <a href="https://never-break-the-chain.vercel.app/dashboard" 
                 style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; font-size: 13px;">
                View Progress
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #f8fafc; padding: 12px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; margin: 0; font-size: 10px;">
              © 2026 Never Break The Chain by Ansh Tank
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Calculate proper weekly stats (Monday to Sunday)
  private static calculateProperWeeklyStats(user: UserProgress) {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Days back to last Monday
    
    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - daysToMonday);
    
    console.log(`📊 DEBUG: Week calculation - Today: ${today.toISOString().split('T')[0]}, Last Monday: ${lastMonday.toISOString().split('T')[0]}`);
    console.log(`📊 DEBUG: User weekly completion rate: ${user.weeklyCompletion}`);
    
    // Get user's custom MNZD names using helper methods
    const topHabit = this.getStrongestHabit(user);
    const improvementArea = this.getWeakestHabit(user);
    
    console.log(`📊 DEBUG: Using custom habit names - Top: ${topHabit}, Improvement: ${improvementArea}`);
    
    // Calculate actual days completed this week
    const actualDaysCompleted = Math.round(user.weeklyCompletion * 7);
    console.log(`📊 DEBUG: Calculated days completed this week: ${actualDaysCompleted}`);
    
    return {
      daysCompleted: actualDaysCompleted,
      totalDays: 7,
      topHabit,
      improvementArea,
      weekStart: lastMonday.toISOString().split('T')[0],
      weekEnd: new Date(lastMonday.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
  }

  // Generate compact weekly summary HTML
  private static generateCompactWeeklyHTML(user: UserProgress, weeklyStats: any): string {
    const completionRate = Math.round((weeklyStats.daysCompleted / weeklyStats.totalDays) * 100);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Weekly Summary</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 12px;">
        <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 16px; text-align: center;">
            <div style="font-size: 32px; margin-bottom: 8px;">📊</div>
            <h1 style="color: white; margin: 0; font-size: 18px; font-weight: 700;">Weekly Summary</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 4px 0 0; font-size: 12px;">Never Break The Chain</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 16px;">
            <h2 style="color: #1e293b; margin: 0 0 12px; font-size: 16px; text-align: center;">Hi ${user.name}! 📈</h2>
            
            <!-- Weekly Stats -->
            <div style="background: #f0f9ff; border: 1px solid #6366f1; border-radius: 8px; padding: 16px; margin: 12px 0; text-align: center;">
              <div style="font-size: 32px; font-weight: 800; color: #4f46e5; margin-bottom: 4px;">
                ${completionRate}%
              </div>
              <p style="color: #4338ca; margin: 0; font-size: 12px; font-weight: 600;">
                Weekly Completion Rate
              </p>
              <p style="color: #6366f1; margin: 4px 0 0; font-size: 11px;">
                ${weeklyStats.daysCompleted} out of ${weeklyStats.totalDays} days completed
              </p>
            </div>
            
            <!-- Week Visualization - FIXED SPACING -->
            <div style="margin: 16px 0;">
              <h3 style="color: #1e293b; margin: 0 0 8px; font-size: 14px; font-weight: 600; text-align: center;">
                ${weeklyStats.weekStart} to ${weeklyStats.weekEnd}
              </h3>
              <div style="display: flex; justify-content: space-between; gap: 4px; margin: 8px 0;">
                ${Array.from({ length: 7 }, (_, i) => `
                  <div style="flex: 1; height: 24px; border-radius: 4px; background-color: ${i < weeklyStats.daysCompleted ? '#10b981' : '#e5e7eb'}; display: flex; align-items: center; justify-content: center; color: ${i < weeklyStats.daysCompleted ? 'white' : '#6b7280'}; font-size: 11px; font-weight: 600;">
                    ${i + 1}
                  </div>
                `).join('')}
              </div>
            </div>
            
            <!-- Insights with Custom MNZD Names -->
            <div style="margin: 16px 0;">
              <h3 style="color: #1e293b; margin: 0 0 8px; font-size: 14px; font-weight: 600; text-align: center;">
                📈 Weekly Insights
              </h3>
              <div style="display: grid; grid-template-columns: 1fr; gap: 8px;">
                <div style="background: #f0fdf4; border: 1px solid #10b981; border-radius: 6px; padding: 12px;">
                  <h4 style="color: #065f46; margin: 0 0 4px; font-size: 13px; font-weight: 600;">
                    🏆 Top Performing Habit
                  </h4>
                  <p style="color: #047857; margin: 0; font-size: 12px;">
                    ${weeklyStats.topHabit} - Keep up the excellent work!
                  </p>
                </div>
                <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 12px;">
                  <h4 style="color: #92400e; margin: 0 0 4px; font-size: 13px; font-weight: 600;">
                    🎯 Growth Opportunity
                  </h4>
                  <p style="color: #a16207; margin: 0; font-size: 12px;">
                    ${weeklyStats.improvementArea} - Small improvements here will make a big difference!
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Next Week Goals -->
            <div style="background: #f3e8ff; border: 1px solid #8b5cf6; border-radius: 8px; padding: 12px; margin: 12px 0;">
              <h3 style="color: #6b21a8; margin: 0 0 8px; font-size: 14px; font-weight: 600; text-align: center;">
                🎯 Next Week's Focus
              </h3>
              <ul style="color: #7c3aed; margin: 0; padding-left: 16px; font-size: 12px; line-height: 1.6;">
                <li>Aim for ${Math.min(completionRate + 15, 100)}% completion rate</li>
                <li>Focus extra attention on ${weeklyStats.improvementArea}</li>
                <li>Maintain momentum in ${weeklyStats.topHabit}</li>
                <li>Add one small improvement to your routine</li>
              </ul>
            </div>
            
            <!-- CTA -->
            <div style="text-align: center; margin: 16px 0;">
              <a href="https://never-break-the-chain.vercel.app/dashboard" 
                 style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; font-size: 13px;">
                📊 View Analytics
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #f8fafc; padding: 12px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; margin: 0; font-size: 10px;">
              © 2026 Never Break The Chain by Ansh Tank
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate compact milestone email HTML
  private static generateCompactMilestoneHTML(user: UserProgress, streakDays: number): string {
    const getMilestoneEmoji = (days: number) => {
      if (days >= 365) return "🌟";
      if (days >= 100) return "👑";
      if (days >= 30) return "💎";
      if (days >= 21) return "💪";
      if (days >= 14) return "🔥";
      if (days >= 7) return "🎯";
      return "✨";
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Milestone Achieved</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 12px;">
        <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); padding: 16px; text-align: center;">
            <div style="font-size: 32px; margin-bottom: 8px;">${getMilestoneEmoji(streakDays)}</div>
            <h1 style="color: white; margin: 0; font-size: 18px; font-weight: 700;">MILESTONE ACHIEVED!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 4px 0 0; font-size: 12px;">Never Break The Chain</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 16px;">
            <h2 style="color: #1e293b; margin: 0 0 12px; font-size: 16px; text-align: center;">Congratulations ${user.name}!</h2>
            
            <!-- Milestone Display - NO CIRCLE, JUST RECTANGLE -->
            <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); border-radius: 12px; padding: 20px; margin: 12px 0; text-align: center;">
              <div style="font-size: 36px; font-weight: 800; color: white; margin-bottom: 4px;">
                ${streakDays}
              </div>
              <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 14px; font-weight: 600;">
                Day Streak!
              </p>
              <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 12px;">
                You've built a life-changing habit!
              </p>
            </div>
            
            <!-- Stats -->
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin: 16px 0;">
              <div style="text-align: center; padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                <div style="font-size: 20px; font-weight: 700; color: #f59e0b; margin-bottom: 2px;">
                  ${streakDays}
                </div>
                <div style="color: #64748b; font-size: 11px;">Consecutive Days</div>
              </div>
              <div style="text-align: center; padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                <div style="font-size: 20px; font-weight: 700; color: #10b981; margin-bottom: 2px;">
                  ${Math.round(streakDays * 2.5)}
                </div>
                <div style="color: #64748b; font-size: 11px;">Hours Invested</div>
              </div>
            </div>
            
            <!-- Quote -->
            <div style="background: #f0f9ff; border-left: 3px solid #0ea5e9; border-radius: 6px; padding: 12px; margin: 12px 0; text-align: center;">
              <p style="color: #0369a1; margin: 0; font-size: 13px; font-style: italic;">
                "Excellence is not an act, but a habit." — Aristotle
              </p>
            </div>
            
            <!-- Next Goal -->
            <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 12px; margin: 12px 0; text-align: center;">
              <h4 style="color: #92400e; margin: 0 0 4px; font-size: 14px; font-weight: 600;">
                🎯 Next Milestone
              </h4>
              <p style="color: #a16207; margin: 0; font-size: 12px;">
                ${streakDays < 30 ? `${30 - streakDays} more days to 30-day milestone!` : 'Keep going for life transformation!'}
              </p>
            </div>
            
            <!-- CTA -->
            <div style="text-align: center; margin: 16px 0;">
              <a href="https://never-break-the-chain.vercel.app/dashboard" 
                 style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; font-size: 13px;">
                🎉 Continue Journey
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #f8fafc; padding: 12px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; margin: 0; font-size: 10px;">
              © 2026 Never Break The Chain by Ansh Tank
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Get users eligible for notifications
  private static async getEligibleUsers(db: any): Promise<UserProgress[]> {
    console.log('🔍 DEBUG: Starting getEligibleUsers...');
    // Get users with email notifications enabled
    const users = await db.collection('users').find({
      email: { $exists: true, $nin: [null, ''] },
      emailNotifications: { $ne: false }
    }).toArray();

    const userProgressList: UserProgress[] = [];

    for (const user of users) {
      try {
        // Get user's MNZD settings for custom habit names
        const userSettings = await db.collection('userSettings').findOne({ userId: user.email });
        
        // Get mnzdConfigs from userSettings
        let mnzdConfigs = userSettings?.mnzdConfigs;
        
        // Final fallback to defaults
        if (!mnzdConfigs || !Array.isArray(mnzdConfigs)) {
          mnzdConfigs = [
            { id: 'meditation', name: 'Meditation' },
            { id: 'nutrition', name: 'Nutrition' },
            { id: 'zone', name: 'Zone' },
            { id: 'discipline', name: 'Discipline' }
          ];
        }

        // Get user's daily progress for streak calculation
        const progressData = await db.collection('dailyProgress')
          .find({ userId: user._id.toString() })
          .sort({ date: -1 })
          .limit(100) // Last 100 days for streak calculation
          .toArray();
        console.log(`🔍 DEBUG: User ${user.email} has ${progressData.length} progress records`);

        // Calculate current streak
        const currentStreak = this.calculateCurrentStreak(progressData);
        const longestStreak = this.calculateLongestStreak(progressData);
        console.log(`🔍 DEBUG: User ${user.email} streaks - Current: ${currentStreak}, Longest: ${longestStreak}`);
        
        // Get today's progress
        const today = new Date().toISOString().split('T')[0];
        const todayProgress = progressData.find((p: any) => p.date === today);
        const completedToday = todayProgress ? todayProgress.tasks.filter((t: any) => t.completed || t.minutes > 0).length : 0;
        console.log(`🔍 DEBUG: User ${user.email} today (${today}) - Completed: ${completedToday}/${mnzdConfigs.length}`);
        if (todayProgress) {
          console.log(`🔍 DEBUG: Today's tasks:`, todayProgress.tasks.map((t: any) => ({ id: t.id, completed: t.completed, minutes: t.minutes })));
        }
        
        // Calculate weekly completion rate
        const weeklyCompletion = this.calculateWeeklyCompletion(progressData, mnzdConfigs.length);
        const monthlyCompletion = this.calculateMonthlyCompletion(progressData, mnzdConfigs.length);
        
        // Calculate habit stats with real MNZD names
        const habitStats = this.calculateRealHabitStats(progressData, mnzdConfigs);
        
        // Get last activity date - FIX: Use most recent progress date
        const lastActivity = progressData.length > 0 ? new Date(progressData[0].date + 'T00:00:00Z') : new Date();
        const daysSinceLastActivity = Math.floor((new Date().getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
        console.log(`🔍 DEBUG: User ${user.email} last activity: ${lastActivity.toISOString().split('T')[0]} (${daysSinceLastActivity} days ago)`);
        console.log(`🔍 DEBUG: Most recent progress date: ${progressData[0]?.date || 'none'}`);
        console.log(`🔍 DEBUG: Today's date: ${today}`);
        
        // FIX: If user has today's progress, they're active today
        const actualDaysSinceActivity = todayProgress ? 0 : daysSinceLastActivity;
        console.log(`🔍 DEBUG: Actual days since activity (corrected): ${actualDaysSinceActivity}`);
        
        const userProgress: UserProgress = {
          userId: user._id.toString(),
          name: user.name || user.email.split('@')[0] || 'Friend',
          email: user.email,
          currentStreak,
          longestStreak,
          lastActivity,
          completedToday,
          totalHabits: mnzdConfigs.length,
          weeklyCompletion,
          monthlyCompletion,
          joinDate: user.createdAt || new Date(),
          preferences: {
            morningTime: '07:00',
            eveningTime: '21:00',
            timezone: 'UTC',
            emailNotifications: user.emailNotifications !== false
          },
          habitStats: habitStats,
          // Add MNZD config for AI personalization
          mnzdConfigs: mnzdConfigs
        };

        userProgressList.push(userProgress);
      } catch (error) {
        console.error(`Error processing user ${user.email}:`, error);
        // Continue with next user
      }
    }

    return userProgressList;
  }

  // Determine which notifications to send to a user
  private static async determineNotificationsForUser(
    user: UserProgress,
    ctx: { now: Date; window: 'auto' | 'morning' | 'evening' | 'weekly' | 'all' }
  ): Promise<Array<{
    type: NotificationType;
    priority: number;
    scheduledTime?: Date;
  }>> {
    const notifications = [];
    const now = ctx.now;
    const useUtc = ctx.window === 'auto';
    const hour = useUtc ? now.getUTCHours() : now.getHours();
    const dayOfWeek = useUtc ? now.getUTCDay() : now.getDay();
    const daysSinceLastActivity = Math.floor((now.getTime() - user.lastActivity.getTime()) / (1000 * 60 * 60 * 24));

    // FIXED: Force notifications when specific window is requested
    const includeMorning = ctx.window === 'morning' || ctx.window === 'all' || (ctx.window === 'auto' && hour >= 1 && hour <= 2);
    const includeMidday = ctx.window === 'all' || (ctx.window === 'auto' && hour >= 6 && hour <= 7);
    const includeEvening = ctx.window === 'evening' || ctx.window === 'all' || (ctx.window === 'auto' && hour >= 12 && hour <= 13);
    const includeWeekly = ctx.window === 'weekly' || ctx.window === 'all' || (ctx.window === 'auto' && dayOfWeek === 0 && hour >= 3 && hour <= 4);
    
    console.log(`🕐 DEBUG: User ${user.email} - Hour: ${hour}, Window: ${ctx.window}, Morning: ${includeMorning}, Midday: ${includeMidday}, Evening: ${includeEvening}`);

    // Morning motivation (7 AM IST)
    if (includeMorning) {
      notifications.push({
        type: NotificationType.MORNING_MOTIVATION,
        priority: 1
      });
    }

    // Midday milestone check (12 PM IST) - ONLY milestones and special notifications
    if (includeMidday) {
      // Milestone celebrations
      const milestones = [3, 7, 14, 21, 30, 45, 66, 90, 120, 180, 240, 300, 366];
      if (milestones.includes(user.currentStreak)) {
        notifications.push({
          type: NotificationType.MILESTONE_CELEBRATION,
          priority: 0
        });
      }

      // Streak recovery
      if (user.currentStreak === 0 && user.longestStreak > 0 && daysSinceLastActivity <= 3) {
        notifications.push({
          type: NotificationType.STREAK_RECOVERY,
          priority: 1
        });
      }

      // Comeback encouragement
      if (daysSinceLastActivity >= 3) {
        notifications.push({
          type: NotificationType.COMEBACK_ENCOURAGEMENT,
          priority: 2
        });
      }
    }

    // Evening check-in (6 PM IST)
    if (includeEvening) {
      notifications.push({
        type: NotificationType.EVENING_CHECKIN,
        priority: 1
      });
      
      // Also check milestones in evening
      const milestones = [3, 7, 14, 21, 30, 45, 66, 90, 120, 180, 240, 300, 366];
      if (milestones.includes(user.currentStreak)) {
        notifications.push({
          type: NotificationType.MILESTONE_CELEBRATION,
          priority: 0
        });
      }
    }

    // Weekly summary (Mondays 9-11 AM)
    if (includeWeekly) {
      notifications.push({
        type: NotificationType.WEEKLY_SUMMARY,
        priority: 2
      });
    }

    // Sort by priority (send important ones first)
    return notifications.sort((a, b) => a.priority - b.priority);
  }

  private static async wasNotificationSentRecently(
    db: any,
    userId: string,
    type: NotificationType,
    now: Date,
    forceWindow?: string
  ): Promise<boolean> {
    // FIXED: Reduce lookback time for forced windows
    const lookbackHours = forceWindow && forceWindow !== 'auto' ? 
      (type === NotificationType.WEEKLY_SUMMARY ? 6 * 24 :
       type === NotificationType.MILESTONE_CELEBRATION ? 12 :
       type === NotificationType.COMEBACK_ENCOURAGEMENT ? 8 :
       6) : // Shorter lookback for forced windows
      (type === NotificationType.WEEKLY_SUMMARY ? 7 * 24 :
       type === NotificationType.MILESTONE_CELEBRATION ? 36 :
       type === NotificationType.COMEBACK_ENCOURAGEMENT ? 24 :
       20);

    const since = new Date(now.getTime() - lookbackHours * 60 * 60 * 1000);

    const existing = await db.collection('notification_logs').findOne({
      userId: new ObjectId(userId),
      type,
      success: true,
      sentAt: { $gte: since }
    });

    const wasRecent = Boolean(existing);
    if (wasRecent) {
      console.log(`⏰ DEBUG: ${type} for ${userId} was sent recently (within ${lookbackHours}h), skipping`);
    }
    return wasRecent;
  }

  // Send individual notification
  private static async sendNotification(user: UserProgress, notification: {
    type: NotificationType;
    priority: number;
  }): Promise<boolean> {
    
    switch (notification.type) {
      case NotificationType.MORNING_MOTIVATION:
        console.log(`🤖 DEBUG: Generating AI morning motivation for ${user.email}`);
        const morningContext = {
          name: user.name,
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
          completionRate: user.weeklyCompletion,
          weakestHabit: this.getWeakestHabit(user),
          strongestHabit: this.getStrongestHabit(user),
          daysSinceJoin: Math.floor((new Date().getTime() - user.joinDate.getTime()) / (1000 * 60 * 60 * 24)),
          timeOfDay: 'morning' as const,
          lastActivity: user.lastActivity,
          mnzdHabits: Object.entries(user.habitStats).map(([id, stats]) => ({
            id,
            name: stats.name,
            description: user.mnzdConfigs?.find(c => c.id === id)?.description || '',
            completed: stats.completed,
            total: stats.total,
            rate: stats.total > 0 ? stats.completed / stats.total : 0
          })),
          todayCompleted: user.completedToday,
          totalHabits: user.totalHabits
        };
        console.log(`🤖 DEBUG: AI context for ${user.email}:`, JSON.stringify(morningContext, null, 2));
        const morningContent = await DynamicContentGenerator.generateMorningMotivation(morningContext);
        console.log(`🤖 DEBUG: AI generated content for ${user.email}:`, morningContent);
        
        // Create AI-powered morning email with user's custom MNZD names
        const morningHtml = this.generateAIMorningEmailHTML(user, morningContent);
        return await sendEmail({
          to: user.email,
          subject: morningContent.subject,
          html: morningHtml
        });

      case NotificationType.EVENING_CHECKIN:
        console.log(`🌙 DEBUG: Generating AI evening check-in for ${user.email}`);
        const eveningContext = {
          name: user.name,
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
          completionRate: user.weeklyCompletion,
          weakestHabit: this.getWeakestHabit(user),
          strongestHabit: this.getStrongestHabit(user),
          daysSinceJoin: Math.floor((new Date().getTime() - user.joinDate.getTime()) / (1000 * 60 * 60 * 24)),
          timeOfDay: 'evening' as const,
          lastActivity: user.lastActivity,
          mnzdHabits: Object.entries(user.habitStats).map(([id, stats]) => ({
            id,
            name: stats.name,
            description: user.mnzdConfigs?.find(c => c.id === id)?.description || '',
            completed: stats.completed,
            total: stats.total,
            rate: stats.total > 0 ? stats.completed / stats.total : 0
          })),
          todayCompleted: user.completedToday,
          totalHabits: user.totalHabits
        };
        const eveningContent = await aiContentService.generateEveningReflection(eveningContext);
        const eveningHtml = this.generateAIEveningEmailHTML(user, eveningContent);
        return await sendEmail({
          to: user.email,
          subject: `🌙 Evening Check-in ${user.name}`,
          html: eveningHtml
        });

      case NotificationType.MILESTONE_CELEBRATION:
        return await sendEmail({
          to: user.email,
          subject: `🎉 ${user.currentStreak} Days - Milestone Achieved!`,
          html: this.generateCompactMilestoneHTML(user, user.currentStreak)
        });

      case NotificationType.STREAK_RECOVERY:
        return await sendStreakRecoveryEmail(
          user.name,
          user.email
        );

      case NotificationType.WEEKLY_SUMMARY:
        const weeklyStats = this.calculateProperWeeklyStats(user);
        console.log(`📊 DEBUG: Weekly stats for ${user.email}:`, weeklyStats);
        return await sendEmail({
          to: user.email,
          subject: `📊 Weekly Summary - ${user.name}`,
          html: this.generateCompactWeeklyHTML(user, weeklyStats)
        });

      case NotificationType.COMEBACK_ENCOURAGEMENT:
        const daysSinceLastActivity = Math.floor((new Date().getTime() - user.lastActivity.getTime()) / (1000 * 60 * 60 * 24));
        console.log(`🔍 DEBUG: Comeback email data for ${user.email}:`);
        console.log(`  - Days since last activity: ${daysSinceLastActivity}`);
        console.log(`  - Last activity date: ${user.lastActivity.toISOString().split('T')[0]}`);
        console.log(`  - Current streak: ${user.currentStreak}`);
        console.log(`  - Longest streak: ${user.longestStreak}`);
        console.log(`  - Today completed: ${user.completedToday}/${user.totalHabits}`);
        
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

  // Generate AI-powered morning email HTML with user's custom MNZD names
  private static generateAIMorningEmailHTML(user: UserProgress, content: any): string {
    // FORCE USE ACTUAL USER MNZD CONFIGS
    const mnzdHabits = user.mnzdConfigs && user.mnzdConfigs.length > 0 ? user.mnzdConfigs : [
      { id: 'meditation', name: 'DSA', color: '#8b5cf6' },
      { id: 'nutrition', name: 'Development', color: '#06b6d4' },
      { id: 'zone', name: 'Communication', color: '#f59e0b' },
      { id: 'discipline', name: 'Tech Update', color: '#10b981' }
    ];
    
    console.log(`🎨 DEBUG: MORNING EMAIL - Using MNZD habits:`, mnzdHabits.map(h => h.name));

    const habitCards = mnzdHabits.map(habit => `
      <div style="background: ${habit.color || '#8b5cf6'}15; border: 1px solid ${habit.color || '#8b5cf6'}40; border-radius: 6px; padding: 8px; text-align: center; margin: 2px;">
        <div style="color: ${habit.color || '#8b5cf6'}; font-size: 13px; font-weight: 600;">${habit.name}</div>
      </div>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Morning Motivation</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 12px;">
        <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 16px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 18px; font-weight: 700;">Good Morning!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 4px 0 0; font-size: 12px;">Never Break The Chain</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 16px;">
            <h2 style="color: #1e293b; margin: 0 0 12px; font-size: 16px;">Hi ${user.name}!</h2>
            
            <!-- Streak Display -->
            <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 12px; margin: 12px 0; text-align: center;">
              <div style="font-size: 24px; font-weight: 800; color: #d97706; margin-bottom: 2px;">
                ${user.currentStreak}
              </div>
              <p style="color: #92400e; margin: 0; font-size: 12px; font-weight: 600;">
                Day Streak
              </p>
            </div>
            
            <!-- AI Message -->
            <div style="background: #f0f9ff; border-left: 3px solid #0ea5e9; border-radius: 6px; padding: 12px; margin: 12px 0;">
              <p style="color: #0369a1; margin: 0; font-size: 14px; line-height: 1.4;">
                ${content.message}
              </p>
            </div>
            
            <!-- Custom MNZD Habits -->
            <div style="margin: 16px 0;">
              <h3 style="color: #1e293b; margin: 0 0 8px; font-size: 14px; font-weight: 600; text-align: center;">
                Today's Focus Areas
              </h3>
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px;">
                ${habitCards}
              </div>
            </div>
            
            <!-- CTA -->
            <div style="text-align: center; margin: 16px 0;">
              <a href="https://never-break-the-chain.vercel.app/dashboard" 
                 style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; font-size: 13px;">
                Start Today's Habits
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #f8fafc; padding: 12px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; margin: 0; font-size: 10px;">
              © 2026 Never Break The Chain by Ansh Tank
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
  private static generateComebackEmailHTML(user: UserProgress, content: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${content.subject}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 12px;">
        <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 16px; text-align: center;">
            <div style="font-size: 32px; margin-bottom: 8px;">🌱</div>
            <h1 style="color: white; margin: 0; font-size: 18px; font-weight: 700;">Fresh Start, ${user.name}!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 4px 0 0; font-size: 12px;">Never Break The Chain</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 16px;">
            <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin: 0 0 12px; text-align: center;">Every master was once a beginner. Your comeback starts now! 💪</p>
            
            <!-- Encouragement Message -->
            <div style="background: #f0fdf4; border: 1px solid #10b981; border-radius: 8px; padding: 16px; margin: 12px 0; text-align: center;">
              <div style="font-size: 24px; margin-bottom: 8px;">🔄</div>
              <h3 style="color: #065f46; margin: 0 0 8px; font-size: 16px; font-weight: 700;">
                Setbacks Are Setups for Comebacks
              </h3>
              <p style="color: #047857; margin: 0; font-size: 14px; line-height: 1.4;">
                Missing a day doesn't erase your progress. It's not about perfection—it's about persistence. Today is your opportunity to restart stronger than before!
              </p>
            </div>
            
            <!-- Recovery Strategy - FIXED NUMBERS -->
            <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <h3 style="color: #1e293b; margin: 0 0 12px; font-size: 16px; font-weight: 600; text-align: center;">
                🎯 Your Recovery Game Plan
              </h3>
              <div style="space-y: 12px;">
                <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                  <div style="background: #10b981; color: white; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; margin-right: 12px; flex-shrink: 0; text-align: center; line-height: 20px;">1</div>
                  <div>
                    <h4 style="color: #1e293b; margin: 0 0 4px; font-size: 14px; font-weight: 600;">Start Small Today</h4>
                    <p style="color: #64748b; margin: 0; font-size: 12px;">Pick just one habit and commit to 5 minutes. Build momentum gradually.</p>
                  </div>
                </div>
                <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                  <div style="background: #10b981; color: white; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; margin-right: 12px; flex-shrink: 0; text-align: center; line-height: 20px;">2</div>
                  <div>
                    <h4 style="color: #1e293b; margin: 0 0 4px; font-size: 14px; font-weight: 600;">Focus on Systems</h4>
                    <p style="color: #64748b; margin: 0; font-size: 12px;">Create an environment that makes good habits easier and bad habits harder.</p>
                  </div>
                </div>
                <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                  <div style="background: #10b981; color: white; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; margin-right: 12px; flex-shrink: 0; text-align: center; line-height: 20px;">3</div>
                  <div>
                    <h4 style="color: #1e293b; margin: 0 0 4px; font-size: 14px; font-weight: 600;">Track Progress</h4>
                    <p style="color: #64748b; margin: 0; font-size: 12px;">Use your dashboard to monitor daily wins and build visual momentum.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Motivational Quote -->
            <div style="background: #fef3c7; border-left: 3px solid #f59e0b; border-radius: 6px; padding: 12px; margin: 12px 0; text-align: center;">
              <p style="color: #92400e; margin: 0 0 8px; font-size: 14px; font-style: italic; font-weight: 500;">
                "Success is not final, failure is not fatal: it is the courage to continue that counts."
              </p>
              <p style="color: #a16207; margin: 0; font-size: 12px;">
                — Winston Churchill
              </p>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 16px 0;">
              <a href="https://never-break-the-chain.vercel.app/dashboard" 
                 style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; font-size: 13px;">
                🚀 Restart My Journey
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #f8fafc; padding: 12px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; margin: 0; font-size: 10px;">
              © 2026 Never Break The Chain by Ansh Tank
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

  // Helper to get strongest habit using actual MNZD names
  private static getStrongestHabit(user: UserProgress): string {
    if (!user.mnzdConfigs || user.mnzdConfigs.length === 0) {
      return 'DSA'; // Your first custom habit
    }
    
    const habits = user.habitStats;
    let strongest = user.mnzdConfigs[0].name; // Default to first habit
    let highestRate = 0;

    Object.entries(habits).forEach(([habitId, stats]) => {
      const rate = stats.total > 0 ? stats.completed / stats.total : 0;
      if (rate > highestRate) {
        highestRate = rate;
        const config = user.mnzdConfigs?.find(c => c.id === habitId);
        strongest = config?.name || stats.name || habitId;
      }
    });

    return strongest;
  }

  // Helper to get weakest habit using actual MNZD names
  private static getWeakestHabit(user: UserProgress): string {
    if (!user.mnzdConfigs || user.mnzdConfigs.length === 0) {
      return 'Development'; // Your second custom habit
    }
    
    const habits = user.habitStats;
    let weakest = user.mnzdConfigs[1]?.name || user.mnzdConfigs[0].name; // Default to second or first habit
    let lowestRate = 1;

    Object.entries(habits).forEach(([habitId, stats]) => {
      const rate = stats.total > 0 ? stats.completed / stats.total : 0;
      if (rate < lowestRate) {
        lowestRate = rate;
        const config = user.mnzdConfigs?.find(c => c.id === habitId);
        weakest = config?.name || stats.name || habitId;
      }
    });

    return weakest;
  }
  private static calculateCurrentStreak(progressData: any[]): number {
    if (!progressData.length) return 0;
    
    let streak = 0;
    const sortedData = progressData.sort((a, b) => b.date.localeCompare(a.date));
    
    for (const dayData of sortedData) {
      // Check if all MNZD tasks were completed (at least some minutes)
      const completedTasks = dayData.tasks?.filter((t: any) => (t.minutes > 0 || t.completed)) || [];
      if (completedTasks.length >= dayData.tasks?.length * 0.75) { // 75% completion threshold
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  private static calculateLongestStreak(progressData: any[]): number {
    if (!progressData.length) return 0;
    
    let longestStreak = 0;
    let currentStreak = 0;
    const sortedData = progressData.sort((a, b) => a.date.localeCompare(b.date));
    
    for (const dayData of sortedData) {
      const completedTasks = dayData.tasks?.filter((t: any) => (t.minutes > 0 || t.completed)) || [];
      if (completedTasks.length >= dayData.tasks?.length * 0.75) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    
    return longestStreak;
  }

  private static calculateWeeklyCompletion(progressData: any[], totalHabits: number): number {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Days back to last Monday
    
    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - daysToMonday);
    const weekStartStr = lastMonday.toISOString().split('T')[0];
    
    console.log(`📊 DEBUG: Weekly calculation - Week starts: ${weekStartStr}, Today: ${today.toISOString().split('T')[0]}`);
    
    const weekData = progressData.filter((p: any) => p.date >= weekStartStr);
    console.log(`📊 DEBUG: Week progress data:`, weekData.map((d: any) => ({ date: d.date, completed: d.tasks?.filter((t: any) => t.completed || t.minutes > 0).length })));
    
    if (!weekData.length) {
      console.log(`📊 DEBUG: No week data found`);
      return 0;
    }
    
    const totalPossible = weekData.length * totalHabits;
    const totalCompleted = weekData.reduce((sum, day) => {
      const completed = day.tasks?.filter((t: any) => t.minutes > 0 || t.completed).length || 0;
      return sum + completed;
    }, 0);
    
    const weeklyRate = totalPossible > 0 ? totalCompleted / totalPossible : 0;
    console.log(`📊 DEBUG: Weekly completion - ${totalCompleted}/${totalPossible} = ${Math.round(weeklyRate * 100)}%`);
    
    return weeklyRate;
  }

  private static calculateMonthlyCompletion(progressData: any[], totalHabits: number): number {
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const monthAgoStr = monthAgo.toISOString().split('T')[0];
    
    const monthData = progressData.filter((p: any) => p.date >= monthAgoStr);
    if (!monthData.length) return 0;
    
    const totalPossible = monthData.length * totalHabits;
    const totalCompleted = monthData.reduce((sum, day) => {
      return sum + (day.tasks?.filter((t: any) => t.minutes > 0 || t.completed).length || 0);
    }, 0);
    
    return totalPossible > 0 ? totalCompleted / totalPossible : 0;
  }

  private static calculateRealHabitStats(progressData: any[], mnzdConfigs: any[]): UserProgress['habitStats'] {
    const stats: any = {};
    
    // Initialize stats for each MNZD config
    mnzdConfigs.forEach(config => {
      stats[config.id] = { completed: 0, total: 0, name: config.name };
    });
    
    // Calculate stats from last 30 days
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const monthAgoStr = monthAgo.toISOString().split('T')[0];
    
    const monthData = progressData.filter((p: any) => p.date >= monthAgoStr);
    
    monthData.forEach(day => {
      day.tasks?.forEach((task: any) => {
        if (stats[task.id]) {
          stats[task.id].total += 1;
          if (task.minutes > 0 || task.completed) {
            stats[task.id].completed += 1;
          }
        }
      });
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
