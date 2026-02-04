import { connectToDatabase } from './mongodb';
import { ObjectId } from 'mongodb';

export interface UserProgressData {
  currentStreak: number;
  totalDays: number;
  totalHours: number;
  avgDailyHours: number;
  lastActivity: Date | null;
  bestStreak: number;
  consistencyRate: number;
  favoriteActivity: string;
  weeklyProgress: number;
  monthlyProgress: number;
}

export interface NotificationTemplate {
  title: string;
  body: string;
  tag: string;
  email: {
    title: string;
    body: string;
    motivation: string;
    personalizedData?: string;
  };
  data?: any;
}

export class DynamicNotificationTemplates {
  
  // Get user progress data for personalization
  static async getUserProgressData(userId: string): Promise<UserProgressData> {
    try {
      const { db } = await connectToDatabase();
      const userObjectId = new ObjectId(userId);
      
      // Get user's progress data
      const progressData = await db.collection('progress').find({ 
        userId: userObjectId 
      }).sort({ date: -1 }).toArray();
      
      if (!progressData.length) {
        return {
          currentStreak: 0,
          totalDays: 0,
          totalHours: 0,
          avgDailyHours: 0,
          lastActivity: null,
          bestStreak: 0,
          consistencyRate: 0,
          favoriteActivity: 'meditation',
          weeklyProgress: 0,
          monthlyProgress: 0
        };
      }
      
      // Calculate metrics
      const totalDays = progressData.length;
      const totalHours = progressData.reduce((sum, day) => 
        sum + (day.meditation || 0) + (day.nutrition || 0) + (day.zone || 0) + (day.discipline || 0), 0
      );
      const avgDailyHours = totalHours / totalDays;
      
      // Calculate current streak
      const currentStreak = this.calculateCurrentStreak(progressData);
      const bestStreak = this.calculateBestStreak(progressData);
      
      // Find favorite activity
      const activityTotals = {
        meditation: progressData.reduce((sum, day) => sum + (day.meditation || 0), 0),
        nutrition: progressData.reduce((sum, day) => sum + (day.nutrition || 0), 0),
        zone: progressData.reduce((sum, day) => sum + (day.zone || 0), 0),
        discipline: progressData.reduce((sum, day) => sum + (day.discipline || 0), 0)
      };
      
      const favoriteActivity = Object.entries(activityTotals)
        .sort(([,a], [,b]) => b - a)[0][0];
      
      // Calculate consistency rates
      const last30Days = progressData.slice(0, 30);
      const last7Days = progressData.slice(0, 7);
      const consistencyRate = (totalDays / Math.max(1, this.daysSinceFirstEntry(progressData))) * 100;
      const weeklyProgress = last7Days.length;
      const monthlyProgress = last30Days.length;
      
      return {
        currentStreak,
        totalDays,
        totalHours: Math.round(totalHours * 10) / 10,
        avgDailyHours: Math.round(avgDailyHours * 10) / 10,
        lastActivity: progressData[0]?.date || null,
        bestStreak,
        consistencyRate: Math.round(consistencyRate),
        favoriteActivity,
        weeklyProgress,
        monthlyProgress
      };
      
    } catch (error) {
      console.error('Error getting user progress data:', error);
      return {
        currentStreak: 0,
        totalDays: 0,
        totalHours: 0,
        avgDailyHours: 0,
        lastActivity: null,
        bestStreak: 0,
        consistencyRate: 0,
        favoriteActivity: 'meditation',
        weeklyProgress: 0,
        monthlyProgress: 0
      };
    }
  }
  
  // Calculate current streak
  private static calculateCurrentStreak(progressData: any[]): number {
    if (!progressData.length) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < progressData.length; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      
      const hasProgress = progressData.some(entry => {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === checkDate.getTime();
      });
      
      if (hasProgress) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }
  
  // Calculate best streak ever
  private static calculateBestStreak(progressData: any[]): number {
    if (!progressData.length) return 0;
    
    const sortedDates = progressData
      .map(entry => new Date(entry.date))
      .sort((a, b) => a.getTime() - b.getTime());
    
    let maxStreak = 1;
    let currentStreak = 1;
    
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = sortedDates[i - 1];
      const currDate = sortedDates[i];
      const dayDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayDiff === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }
    
    return maxStreak;
  }
  
  // Calculate days since first entry
  private static daysSinceFirstEntry(progressData: any[]): number {
    if (!progressData.length) return 1;
    
    const firstEntry = new Date(progressData[progressData.length - 1].date);
    const today = new Date();
    return Math.floor((today.getTime() - firstEntry.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }
  
  // Get time-appropriate greeting
  private static getTimeGreeting(): { greeting: string; emoji: string; timeContext: string } {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return {
        greeting: 'Good morning',
        emoji: '🌅',
        timeContext: 'Start your day strong'
      };
    } else if (hour >= 12 && hour < 17) {
      return {
        greeting: 'Good afternoon',
        emoji: '☀️',
        timeContext: 'Keep the momentum going'
      };
    } else if (hour >= 17 && hour < 21) {
      return {
        greeting: 'Good evening',
        emoji: '🌆',
        timeContext: 'Time to reflect and plan'
      };
    } else {
      return {
        greeting: 'Good evening',
        emoji: '🌙',
        timeContext: 'Wind down and prepare for tomorrow'
      };
    }
  }
  
  // Generate morning notification
  static async generateMorningNotification(userId: string, userName: string): Promise<NotificationTemplate> {
    const progressData = await this.getUserProgressData(userId);
    const { greeting, emoji, timeContext } = this.getTimeGreeting();
    
    const motivationalPhrases = [
      "Today's the day to level up your game!",
      "Your future self is cheering you on!",
      "Every champion was once a beginner who refused to give up!",
      "Small steps today, giant leaps tomorrow!",
      "You're not just building habits, you're building character!"
    ];
    
    const randomMotivation = motivationalPhrases[Math.floor(Math.random() * motivationalPhrases.length)];
    
    let personalizedMessage = '';
    if (progressData.currentStreak > 0) {
      personalizedMessage = `You're on a ${progressData.currentStreak}-day streak! `;
    } else if (progressData.totalDays > 0) {
      personalizedMessage = `You've completed ${progressData.totalDays} days of MNZD! `;
    }
    
    const activityEmojis = {
      meditation: '🧘',
      nutrition: '🥗',
      zone: '💪',
      discipline: '🎯'
    };
    
    return {
      title: `${emoji} ${greeting}, ${userName}!`,
      body: `${personalizedMessage}${timeContext} with MNZD!`,
      tag: 'morning-reminder',
      email: {
        title: `${emoji} Rise & Shine, ${userName}! Your MNZD Journey Awaits`,
        body: `${greeting}, superstar! ${emoji} Another beautiful day to build your legendary chain! ${personalizedMessage}Your dedication to the MNZD methodology is truly inspiring.`,
        motivation: `${randomMotivation} ${activityEmojis[progressData.favoriteActivity as keyof typeof activityEmojis]} Your favorite activity seems to be ${progressData.favoriteActivity} - let's make it count today!`,
        personalizedData: progressData.totalHours > 0 ? 
          `🏆 Your Stats: ${progressData.totalHours}h invested • ${progressData.consistencyRate}% consistency • ${progressData.currentStreak} day streak` : 
          '🌟 Ready to start your transformation journey? Every expert was once a beginner!'
      }
    };
  }
  
  // Generate evening notification
  static async generateEveningNotification(userId: string, userName: string): Promise<NotificationTemplate> {
    const progressData = await this.getUserProgressData(userId);
    const { greeting, emoji, timeContext } = this.getTimeGreeting();
    
    const reflectionPrompts = [
      "What was your biggest win today?",
      "How did you grow stronger today?",
      "What habit served you best today?",
      "What are you grateful for in your journey?",
      "How will tomorrow be even better?"
    ];
    
    const randomPrompt = reflectionPrompts[Math.floor(Math.random() * reflectionPrompts.length)];
    
    // Check if user logged progress today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const hasProgressToday = progressData.lastActivity && 
      new Date(progressData.lastActivity).setHours(0, 0, 0, 0) === today.getTime();
    
    let personalizedMessage = '';
    if (hasProgressToday) {
      personalizedMessage = "Great job logging your progress today! ";
    } else if (progressData.currentStreak > 0) {
      personalizedMessage = `Don't forget to log today's progress to keep your ${progressData.currentStreak}-day streak alive! `;
    }
    
    return {
      title: `${emoji} ${greeting}, ${userName}!`,
      body: `${personalizedMessage}${timeContext}`,
      tag: 'evening-checkin',
      email: {
        title: `${emoji} Evening Reflection with ${userName}`,
        body: `${greeting}, habit hero! ${emoji} ${personalizedMessage}Time to reflect on another day of growth and prepare for tomorrow's victories.`,
        motivation: `${randomPrompt} Remember: every sunset is proof that endings can be beautiful too. You're building something amazing, one day at a time! 🌟`,
        personalizedData: progressData.weeklyProgress > 0 ? 
          `📊 This Week: ${progressData.weeklyProgress}/7 days logged • Monthly: ${progressData.monthlyProgress}/30 days` : 
          '🎯 Ready to make tomorrow count? Your consistency is your superpower!'
      }
    };
  }
  
  // Generate missed day notification
  static async generateMissedDayNotification(userId: string, userName: string): Promise<NotificationTemplate> {
    const progressData = await this.getUserProgressData(userId);
    
    const encouragingMessages = [
      "Every champion has comeback stories!",
      "The best time to restart is right now!",
      "Your chain is waiting for you to pick it up again!",
      "One missed day doesn't define your journey!",
      "Resilience is built in moments like these!"
    ];
    
    const randomEncouragement = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
    
    let personalizedMessage = '';
    if (progressData.bestStreak > progressData.currentStreak) {
      personalizedMessage = `You've built a ${progressData.bestStreak}-day streak before - you can do it again! `;
    } else if (progressData.totalDays > 0) {
      personalizedMessage = `You've successfully completed ${progressData.totalDays} days of MNZD. `;
    }
    
    return {
      title: `🔗 Your Chain Misses You, ${userName}!`,
      body: `${personalizedMessage}Ready to get back on track?`,
      tag: 'missed-reminder',
      email: {
        title: `🔗 Comeback Time, ${userName}! Your Chain is Calling`,
        body: `Hey champion! 👋 We noticed you took a little break from your MNZD journey. ${personalizedMessage}No worries - even superheroes need rest days sometimes!`,
        motivation: `${randomEncouragement} Your dedication has brought you this far, and it will carry you forward. The only way to fail is to stop trying completely! 🚀`,
        personalizedData: progressData.totalHours > 0 ? 
          `💪 Remember: You've already invested ${progressData.totalHours} hours in yourself. That's not going anywhere!` : 
          '🌟 Every expert was once a beginner. Today is a perfect day to begin again!'
      }
    };
  }
  
  // Generate milestone notification
  static async generateMilestoneNotification(
    userId: string, 
    userName: string, 
    milestoneType: 'streak' | 'hours' | 'consistency' | 'days',
    value: number
  ): Promise<NotificationTemplate> {
    const progressData = await this.getUserProgressData(userId);
    
    const celebrationMessages = {
      streak: [
        "You're officially a consistency legend!",
        "Your dedication is absolutely inspiring!",
        "This is what champions are made of!",
        "You're rewriting the rules of excellence!",
        "Your future self is doing a victory dance!"
      ],
      hours: [
        "Time is the most valuable investment!",
        "You're building compound interest in yourself!",
        "Every hour invested pays dividends forever!",
        "You're not just spending time, you're investing it!",
        "This is how legends are forged!"
      ],
      consistency: [
        "Consistency is the mother of mastery!",
        "You're proving that small actions create big results!",
        "Your reliability is your superpower!",
        "This is what sustainable success looks like!",
        "You're building unshakeable habits!"
      ],
      days: [
        "Every day counts, and you're proving it!",
        "You're building a legacy, one day at a time!",
        "Your commitment is absolutely remarkable!",
        "This is the foundation of greatness!",
        "You're showing the world what dedication looks like!"
      ]
    };
    
    const randomCelebration = celebrationMessages[milestoneType][
      Math.floor(Math.random() * celebrationMessages[milestoneType].length)
    ];
    
    const milestoneEmojis = {
      streak: '🔥',
      hours: '⏰',
      consistency: '📊',
      days: '📅'
    };
    
    const milestoneLabels = {
      streak: 'Day Streak',
      hours: 'Hours Invested',
      consistency: 'Consistency Rate',
      days: 'Days Completed'
    };
    
    return {
      title: `🏆 ${value} ${milestoneLabels[milestoneType]} Milestone!`,
      body: `${userName}, you've achieved something incredible!`,
      tag: 'milestone-celebration',
      data: { type: milestoneType, value },
      email: {
        title: `🏆 LEGENDARY MILESTONE: ${value} ${milestoneLabels[milestoneType]}!`,
        body: `STOP EVERYTHING! 🛑 ${userName}, you just hit an absolutely incredible milestone! ${value} ${milestoneLabels[milestoneType].toLowerCase()} - we're literally doing a happy dance over here! 💃🕺`,
        motivation: `${randomCelebration} You're not just building habits, you're building a legacy that will inspire others for years to come! 🌟`,
        personalizedData: `🎯 Your Journey: ${progressData.totalDays} days • ${progressData.totalHours}h invested • ${progressData.consistencyRate}% consistency • Best streak: ${progressData.bestStreak} days`
      }
    };
  }
  
  // Generate random motivation notification
  static async generateRandomMotivationNotification(userId: string, userName: string): Promise<NotificationTemplate> {
    const progressData = await this.getUserProgressData(userId);
    const { greeting, emoji } = this.getTimeGreeting();
    
    const motivationTypes = [
      {
        title: '💪 Power Moment Alert!',
        body: 'Quick energy check: How\'s your MNZD momentum?',
        emailTitle: '💪 POWER MOMENT ALERT!',
        emailBody: `Hey ${userName}! Just dropping by to remind you that you're absolutely crushing it! Every moment is a chance to level up your MNZD game!`,
        motivation: 'Small actions, when multiplied by consistency, create extraordinary results! You are proof that dedication pays off! 🚀'
      },
      {
        title: '🎯 Focus Checkpoint!',
        body: 'What\'s your next MNZD victory going to be?',
        emailTitle: '🎯 FOCUS CHECKPOINT!',
        emailBody: `Time for a quick focus check, ${userName}! Your future self is counting on the decisions you make right now. What's your next move?`,
        motivation: 'Champions are not made in comfort zones. They are made in moments like this! Every choice is a chance to become stronger! 💎'
      },
      {
        title: '⚡ Energy Boost Time!',
        body: 'Ready to add some spark to your MNZD routine?',
        emailTitle: '⚡ ENERGY BOOST INCOMING!',
        emailBody: `${greeting}, ${userName}! ${emoji} Sending you a burst of positive energy for your MNZD journey! You've got this!`,
        motivation: 'Your energy is contagious, your dedication is inspiring, and your progress is undeniable! Keep shining! ✨'
      },
      {
        title: '🌟 Inspiration Moment!',
        body: 'Remember why you started this amazing journey!',
        emailTitle: '🌟 INSPIRATION DELIVERY!',
        emailBody: `Hey superstar ${userName}! Just a friendly reminder that you're on an incredible journey of self-improvement. Every step matters!`,
        motivation: 'You started this journey for a reason, and that reason is still valid. You are becoming the person you always knew you could be! 🦋'
      }
    ];
    
    const randomType = motivationTypes[Math.floor(Math.random() * motivationTypes.length)];
    
    return {
      title: randomType.title,
      body: randomType.body,
      tag: 'random-motivation',
      email: {
        title: randomType.emailTitle,
        body: randomType.emailBody,
        motivation: randomType.motivation,
        personalizedData: progressData.currentStreak > 0 ? 
          `🔥 Current streak: ${progressData.currentStreak} days | Keep the fire burning!` : 
          '🌱 Every journey begins with a single step. You\'re already on your way!'
      }
    };
  }
  
  // Generate streak celebration notification
  static async generateStreakNotification(userId: string, userName: string, streakDays: number): Promise<NotificationTemplate> {
    const progressData = await this.getUserProgressData(userId);
    
    const streakMessages = {
      7: "One week of excellence! You're building momentum!",
      14: "Two weeks strong! You're proving your commitment!",
      21: "Three weeks of consistency! Habits are forming!",
      30: "One month of dedication! You're unstoppable!",
      60: "Two months of excellence! You're a habit master!",
      100: "100 days! You're officially a consistency legend!",
      365: "One full year! You've achieved something extraordinary!"
    };
    
    const defaultMessage = `${streakDays} days of pure dedication! You're amazing!`;
    const streakMessage = streakMessages[streakDays as keyof typeof streakMessages] || defaultMessage;
    
    return {
      title: `🔥 ${streakDays}-Day Streak Champion!`,
      body: `${userName}, ${streakMessage}`,
      tag: 'streak-celebration',
      data: { streak: streakDays },
      email: {
        title: `🔥 STREAK CHAMPION: ${userName} - ${streakDays} Days!`,
        body: `Alert! Alert! 🚨 We have a consistency champion in the building! ${userName}, your ${streakDays}-day streak is so hot, it's practically glowing! ✨`,
        motivation: `${streakMessage} At this rate, you'll be teaching masterclasses on "How to Be Awesome Daily." Keep that momentum rolling! 🎯`,
        personalizedData: `🏆 Your Stats: ${progressData.totalHours}h invested • ${progressData.consistencyRate}% consistency • Best streak: ${Math.max(progressData.bestStreak, streakDays)} days`
      }
    };
  }
}