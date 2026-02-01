// Advanced Intelligent Notification System with Inactivity Detection
export interface UserProgress {
  completed: number; // 0-4 MNZD tasks completed
  streak: number;
  timeOfDay: "morning" | "evening";
  patterns: {
    usualCompletionTime: string;
    strongestPillar: string;
    weakestPillar: string;
    weekdayPerformance: number;
    weekendPerformance: number;
  };
}

export interface ActivityData {
  lastActivity: number;
  sessionStart: number;
  totalActiveTime: number;
  inactivityStreak: number;
  dailyActiveTime: number;
}

// Welcome messages for new users
const welcomeMessages = [
  "🎉 Welcome to your transformation journey! Your first chain link starts now! ✨",
  "🚀 Amazing! You've just taken the most important step - starting! Let's build something incredible together! 💎",
  "🌟 Your future self is already thanking you! Ready to never break the chain? 🔗",
  "💪 Welcome aboard, chain builder! Every expert was once a beginner - your journey starts today! 🎯",
  "🔥 Fantastic! You're now part of an exclusive club of people who actually take action! Let's go! ⚡"
];

// Morning Motivational Messages (7 AM)
const morningMessages = {
  fresh: [
    "🌅 Rise and shine, chain builder! Today's link awaits your magic ✨",
    "☕ Coffee's brewing, goals are calling! Let's make today legendary 🚀",
    "🔥 Your future self is cheering you on. Time to make them proud!",
    "⚡ New day, new chance to be unstoppable. Your chain is hungry! 🍽️",
    "🎯 Champions don't wait for motivation - they create it. Let's go!",
  ],
  streak: [
    "🔥 {streak} days strong! You're on fire - don't let it cool down! 🌟",
    "💪 {streak} days of pure dedication! Your consistency is inspiring! ✨",
    "🚀 {streak} days and counting! You're building something beautiful! 🎨",
    "⭐ {streak} days of showing up! That's the spirit of a true champion! 🏆",
    "🌟 {streak} days of never giving up! Your chain is getting stronger! 💎",
  ],
};

// Evening Check-in Messages (Based on completion)
const eveningMessages = {
  allComplete: [
    "🎉 BOOM! All 4 pillars conquered! You're absolutely crushing it! 👑",
    "🏆 Perfect day achieved! Your dedication is next level! 🌟",
    "💎 4/4 complete! You just added a diamond link to your chain! ✨",
    "🚀 Mission accomplished! Your future self is doing a happy dance! 💃",
    "⚡ Flawless execution! You're the definition of unstoppable! 🔥",
  ],
  threeComplete: [
    "🌟 3/4 done! You're so close to perfection! One more push? 💪",
    "🎯 Amazing progress! Just one pillar left to make it legendary! ⭐",
    "🔥 3 pillars strong! Your {weakest} is calling for some love! 💝",
    "⚡ You're 75% there! Finish strong and own this day! 🚀",
    "💪 3 down, 1 to go! Champions finish what they start! 🏆",
  ],
  twoComplete: [
    "💪 Halfway hero! 2/4 complete - momentum is building! 🌊",
    "🎯 Good start! Your {strongest} game is strong! Keep the energy flowing! ⚡",
    "🌟 2 pillars standing tall! Time to rally and grab 2 more! 🚀",
    "🔥 You've got this! 2 down, 2 to go - balance is key! ⚖️",
    "💎 Solid foundation with 2/4! Let's build higher! 🏗️",
  ],
  oneComplete: [
    "🌱 Every journey starts with one step! 1/4 is progress! 🚶♂️",
    "💪 Your {strongest} pillar is solid! Time to strengthen the others! 🏗️",
    "⭐ 1 down, 3 to go! Small wins lead to big victories! 🎯",
    "🔥 You showed up! That's what separates winners from wishers! 🏆",
    "🌟 One pillar strong! Your chain is still alive - keep building! 🔗",
  ],
  noneComplete: [
    "🤗 Tough day? We all have them! Tomorrow is a fresh start! 🌅",
    "💝 Your chain isn't broken - it's just taking a breather! Rest and reset! 😴",
    "🌟 Even champions have off days! What matters is getting back up! 💪",
    "🔄 Reset button activated! Tomorrow you'll come back stronger! 🚀",
    "💎 Diamonds are made under pressure! This is your comeback story! ✨",
  ],
};

// Advanced Inactivity Messages with Smart Timing
const inactivityMessages = {
  gentle: {
    // 30 minutes - 2 hours
    messages: [
      "👋 Quick check-in! Your MNZD journey is still calling! 📞",
      "🌟 Gentle reminder: Small progress is still progress! 🐣",
      "💡 Quick thought: Which pillar feels most doable right now? 🤔",
      "⚡ 5-minute power move: Pick one MNZD task and crush it! 💪",
      "🎯 Micro-win opportunity: What's the smallest step you can take? 👣",
    ],
    interval: { min: 30, max: 120 } // 30 min to 2 hours
  },
  encouraging: {
    // 2-4 hours
    messages: [
      "🔔 Friendly nudge: Your chain misses you! Ready to reconnect? 🔗",
      "⏰ Time check: A few minutes of MNZD can energize your day! ⚡",
      "🎯 Opportunity alert: Perfect moment for a quick win! 🏹",
      "🌱 Growth moment: Even 10 minutes counts toward your goals! 📈",
      "💝 Self-care reminder: Your future self will thank you! 🙏",
    ],
    interval: { min: 120, max: 240 } // 2-4 hours
  },
  motivational: {
    // 4-8 hours
    messages: [
      "🔥 Your chain is waiting! Which pillar will you strengthen next? 💎",
      "🏆 Champions show up even when they don't feel like it. That's you! 👑",
      "⭐ Plot twist: Today's the day you surprise yourself with progress! 🎭",
      "🚀 Momentum builder: One MNZD task can shift your entire day! ⚡",
      "💪 Strength reminder: You've overcome 100% of your tough days so far! 🌟",
    ],
    interval: { min: 240, max: 480 } // 4-8 hours
  },
  comeback: {
    // 8+ hours
    messages: [
      "🌅 New chapter: Every moment is a fresh start for your habits! 📖",
      "💪 Comeback time: You've got this - one step at a time! 🚶♂️",
      "🔄 Reset mode: Today still has potential for progress! 🌟",
      "🎯 Fresh perspective: What feels achievable right now? 🌈",
      "⚡ Restart energy: Your chain is ready for its next link! 🔗",
    ],
    interval: { min: 480, max: 1440 } // 8-24 hours
  }
};

// Smart contextual messages based on time of day
const contextualMessages = {
  morning: [
    "🌅 Morning energy boost: Start with your strongest MNZD pillar! ☕",
    "🔥 Morning momentum: Which habit will set the tone for your day? 🎯",
    "⚡ Fresh start energy: Your morning choices shape your entire day! 🌟",
  ],
  afternoon: [
    "☀️ Midday check-in: How's your MNZD progress looking? 📊",
    "🎯 Afternoon opportunity: Perfect time for a productivity boost! ⚡",
    "💪 Power hour: Use this energy surge for your habits! 🚀",
  ],
  evening: [
    "🌆 Evening reflection: What MNZD wins can you celebrate today? 🎉",
    "🔥 Golden hour: Perfect time to complete your remaining pillars! ✨",
    "🎯 Day's end approach: Finish strong with your habits! 💪",
  ],
  night: [
    "🌙 Night owl mode: Even small progress counts! 🦉",
    "⭐ Late night opportunity: Quick MNZD check before bed? 😴",
    "💫 Peaceful moment: End your day with intention! 🧘♂️",
  ]
};

// Pattern-based messages
const patternMessages = {
  weekendWarrior: "🎉 Weekend warrior detected! You crush it on weekends! 💪",
  weekdayChamp: "💼 Weekday champion! Your work-life balance is inspiring! ⚖️",
  morningPerson: "🌅 Early bird catches the worm! Your morning game is strong! ☕",
  nightOwl: "🦉 Night owl productivity! You shine when others sleep! 🌙",
  consistentStar: "⭐ Mr./Ms. Consistent! Your steady rhythm is beautiful! 🎵",
  comebackKing: "👑 Comeback royalty! You bounce back like a champion! 🏀",
};

// Advanced Smart Notification Logic
export class NotificationService {
  private static activityData: ActivityData = {
    lastActivity: Date.now(),
    sessionStart: Date.now(),
    totalActiveTime: 0,
    inactivityStreak: 0,
    dailyActiveTime: 0
  };
  
  private static inactivityTimer: NodeJS.Timeout | null = null;
  private static dailyResetTimer: NodeJS.Timeout | null = null;
  private static serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private static isInitialized = false;

  // Initialize the advanced notification system
  static async initialize(): Promise<void> {
    if (this.isInitialized || typeof window === 'undefined') return;
    
    try {
      await this.initializeServiceWorker();
      this.setupActivityTracking();
      this.startInactivityMonitoring();
      this.scheduleDailyReset();
      this.isInitialized = true;
      
      console.log('Advanced Notification System initialized successfully');
    } catch (error) {
      console.error('Failed to initialize notification system:', error);
    }
  }

  // Initialize service worker for persistent notifications
  static async initializeServiceWorker(): Promise<void> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.log('Service Worker not supported');
      return;
    }

    try {
      // Unregister any existing service workers first
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
      
      // Register new service worker with proper path
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });
      
      this.serviceWorkerRegistration = registration;
      console.log('Service Worker registered successfully');
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      
      await this.requestPermission();
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      // Continue without service worker
    }
  }

  // Setup comprehensive activity tracking
  static setupActivityTracking(): void {
    if (typeof window === 'undefined') return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const updateActivity = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - this.activityData.lastActivity;
      
      // Only count as active time if less than 5 minutes since last activity
      if (timeSinceLastActivity < 5 * 60 * 1000) {
        this.activityData.totalActiveTime += timeSinceLastActivity;
        this.activityData.dailyActiveTime += timeSinceLastActivity;
      }
      
      this.activityData.lastActivity = now;
      this.activityData.inactivityStreak = 0;
      
      // Reset inactivity timer
      this.resetInactivityTimer();
    };

    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        updateActivity();
      }
    });
  }

  // Advanced inactivity monitoring with smart intervals
  static startInactivityMonitoring(): void {
    this.resetInactivityTimer();
  }

  private static resetInactivityTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }

    // Start with gentle reminders after 30 minutes
    this.inactivityTimer = setTimeout(() => {
      this.handleInactivity();
    }, 30 * 60 * 1000); // 30 minutes
  }

  private static handleInactivity(): void {
    const now = Date.now();
    const inactiveMinutes = (now - this.activityData.lastActivity) / (1000 * 60);
    
    this.activityData.inactivityStreak++;
    
    let messageCategory: keyof typeof inactivityMessages;
    let nextCheckInterval: number;

    if (inactiveMinutes < 120) {
      messageCategory = 'gentle';
      nextCheckInterval = 45 * 60 * 1000; // Check again in 45 minutes
    } else if (inactiveMinutes < 240) {
      messageCategory = 'encouraging';
      nextCheckInterval = 60 * 60 * 1000; // Check again in 1 hour
    } else if (inactiveMinutes < 480) {
      messageCategory = 'motivational';
      nextCheckInterval = 90 * 60 * 1000; // Check again in 1.5 hours
    } else {
      messageCategory = 'comeback';
      nextCheckInterval = 120 * 60 * 1000; // Check again in 2 hours
    }

    // Add contextual timing
    const contextualMessage = this.getContextualMessage();
    const inactivityMessage = this.getInactivityMessage(messageCategory);
    
    // Alternate between contextual and inactivity messages
    const message = this.activityData.inactivityStreak % 2 === 1 ? contextualMessage : inactivityMessage;
    
    this.sendNotification("🔗 Gentle Reminder", message);
    
    // Schedule next check with exponential backoff (max 4 hours)
    const maxInterval = 4 * 60 * 60 * 1000;
    const adjustedInterval = Math.min(nextCheckInterval * Math.pow(1.2, this.activityData.inactivityStreak - 1), maxInterval);
    
    this.inactivityTimer = setTimeout(() => {
      this.handleInactivity();
    }, adjustedInterval);
  }

  private static getInactivityMessage(category: keyof typeof inactivityMessages): string {
    const messages = inactivityMessages[category].messages;
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private static getContextualMessage(): string {
    const hour = new Date().getHours();
    let timeCategory: keyof typeof contextualMessages;
    
    if (hour >= 5 && hour < 12) timeCategory = 'morning';
    else if (hour >= 12 && hour < 17) timeCategory = 'afternoon';
    else if (hour >= 17 && hour < 22) timeCategory = 'evening';
    else timeCategory = 'night';
    
    const messages = contextualMessages[timeCategory];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // Schedule daily reset at midnight
  private static scheduleDailyReset(): void {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    this.dailyResetTimer = setTimeout(() => {
      this.resetDailyStats();
      this.scheduleDailyReset(); // Schedule next reset
    }, msUntilMidnight);
  }

  private static resetDailyStats(): void {
    this.activityData.dailyActiveTime = 0;
    this.activityData.sessionStart = Date.now();
    console.log('Daily activity stats reset');
  }

  // Get activity insights
  static getActivityInsights(): {
    dailyActiveMinutes: number;
    sessionActiveMinutes: number;
    inactivityStreak: number;
    isActiveUser: boolean;
  } {
    const now = Date.now();
    const sessionTime = now - this.activityData.sessionStart;
    
    return {
      dailyActiveMinutes: Math.round(this.activityData.dailyActiveTime / (1000 * 60)),
      sessionActiveMinutes: Math.round(this.activityData.totalActiveTime / (1000 * 60)),
      inactivityStreak: this.activityData.inactivityStreak,
      isActiveUser: (now - this.activityData.lastActivity) < 30 * 60 * 1000 // Active if last activity < 30 min
    };
  }

  static generateMorningMessage(progress: UserProgress): string {
    if (progress.streak > 7) {
      const message =
        morningMessages.streak[
          Math.floor(Math.random() * morningMessages.streak.length)
        ];
      return message.replace("{streak}", progress.streak.toString());
    }
    return morningMessages.fresh[
      Math.floor(Math.random() * morningMessages.fresh.length)
    ];
  }

  static generateEveningMessage(progress: UserProgress): string {
    const { completed, patterns } = progress;
    let messages: string[] = [];

    switch (completed) {
      case 4:
        messages = eveningMessages.allComplete;
        break;
      case 3:
        messages = eveningMessages.threeComplete;
        break;
      case 2:
        messages = eveningMessages.twoComplete;
        break;
      case 1:
        messages = eveningMessages.oneComplete;
        break;
      default:
        messages = eveningMessages.noneComplete;
    }

    let message = messages[Math.floor(Math.random() * messages.length)];

    // Replace placeholders
    message = message.replace("{weakest}", patterns.weakestPillar);
    message = message.replace("{strongest}", patterns.strongestPillar);

    return message;
  }

  static getPatternMessage(progress: UserProgress): string | null {
    const { patterns } = progress;

    if (patterns.weekendPerformance > patterns.weekdayPerformance * 1.5) {
      return patternMessages.weekendWarrior;
    }
    if (patterns.weekdayPerformance > patterns.weekendPerformance * 1.5) {
      return patternMessages.weekdayChamp;
    }
    if (patterns.usualCompletionTime < "12:00") {
      return patternMessages.morningPerson;
    }
    if (patterns.usualCompletionTime > "20:00") {
      return patternMessages.nightOwl;
    }

    return null;
  }

  // Send welcome notification for new users
  static async sendWelcomeNotification(): Promise<void> {
    if (typeof window === "undefined") return;

    // Check if website notifications are disabled
    if (localStorage.getItem('websiteNotificationsDisabled') === 'true') {
      console.log('Website notifications disabled, skipping welcome notification');
      return;
    }

    if (await this.requestPermission()) {
      const message = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
      
      // Add a small delay to ensure everything is set up
      setTimeout(() => {
        // Send welcome notification immediately
        new Notification("🎆 Never Break The Chain", {
          body: message,
          tag: "welcome-message",
          requireInteraction: true, // Keep it visible longer
          silent: false,
          icon: '/favicon.svg',
        });
        
        console.log('Welcome notification sent:', message);
      }, 1000); // 1 second delay
    }
  }

  // Browser Notification API with Service Worker support
  static async requestPermission(): Promise<boolean> {
    if (typeof window === "undefined" || !("Notification" in window)) {
      console.log("This browser does not support notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        // Initialize service worker after permission granted
        if (!this.serviceWorkerRegistration) {
          await this.initializeServiceWorker();
        }
        return true;
      }
    }

    return false;
  }

  static async sendNotification(
    title: string,
    message: string,
    icon?: string,
  ): Promise<void> {
    if (typeof window === "undefined") return;

    // Check if website notifications are disabled
    if (localStorage.getItem('websiteNotificationsDisabled') === 'true') {
      console.log('Website notifications disabled, skipping notification');
      return;
    }

    if (await this.requestPermission()) {
      // Use Service Worker for better notification support
      if (this.serviceWorkerRegistration) {
        try {
          await this.serviceWorkerRegistration.showNotification(title, {
            body: message,
            icon: icon || '/favicon.svg',
            badge: '/favicon.svg',
            tag: "chain-reminder",
            requireInteraction: false,
            silent: false,
            actions: [
              {
                action: 'open',
                title: 'Open App'
              },
              {
                action: 'dismiss', 
                title: 'Dismiss'
              }
            ],
            data: {
              url: '/dashboard',
              timestamp: Date.now()
            }
          });
          return;
        } catch (error) {
          console.error('Service Worker notification failed:', error);
        }
      }
      
      // Fallback to regular notification
      new Notification(title, {
        body: message,
        icon: icon || '/favicon.svg',
        tag: "chain-reminder",
        requireInteraction: false,
        silent: false,
      });
    }
  }

  // Enhanced scheduling with smart timing
  static scheduleNotifications(progress: UserProgress): void {
    if (typeof window === 'undefined') {
      console.log('Skipping notification scheduling on server side');
      return;
    }

    // Initialize the advanced system
    this.initialize();

    // Check if it's time for morning notification (7 AM)
    const now = new Date();
    const currentHour = now.getHours();

    // If it's before 7 AM, schedule morning notification for today
    if (currentHour < 7) {
      const morningTime = new Date();
      morningTime.setHours(7, 0, 0, 0);
      const delay = morningTime.getTime() - now.getTime();

      setTimeout(() => {
        const message = this.generateMorningMessage(progress);
        this.sendNotification("🔗 Never Break The Chain", message);
      }, delay);
    }

    // If it's before 8 PM, schedule evening notification for today
    if (currentHour < 20) {
      const eveningTime = new Date();
      eveningTime.setHours(20, 0, 0, 0);
      const delay = eveningTime.getTime() - now.getTime();

      setTimeout(() => {
        const message = this.generateEveningMessage(progress);
        this.sendNotification("🎯 Daily Check-in", message);

        // Add pattern message if available
        const patternMsg = this.getPatternMessage(progress);
        if (patternMsg) {
          setTimeout(() => {
            this.sendNotification("🧠 Smart Insight", patternMsg);
          }, 5000);
        }
      }, delay);
    }

    // Schedule for next day if both times have passed
    if (currentHour >= 20) {
      // Schedule tomorrow's morning notification
      const tomorrowMorning = new Date();
      tomorrowMorning.setDate(tomorrowMorning.getDate() + 1);
      tomorrowMorning.setHours(7, 0, 0, 0);
      const delay = tomorrowMorning.getTime() - now.getTime();

      setTimeout(() => {
        const message = this.generateMorningMessage(progress);
        this.sendNotification("🔗 Never Break The Chain", message);
      }, delay);
    }
  }

  // Cleanup method
  static cleanup(): void {
    if (typeof window === 'undefined') return;
    
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
    if (this.dailyResetTimer) {
      clearTimeout(this.dailyResetTimer);
      this.dailyResetTimer = null;
    }
    this.isInitialized = false;
    console.log('Notification system cleaned up');
  }
}

// Export for use in components
export default NotificationService;