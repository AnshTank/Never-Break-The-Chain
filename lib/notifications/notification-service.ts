// Intelligent Notification System
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
    "🌱 Every journey starts with one step! 1/4 is progress! 🚶‍♂️",
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

// Random Smart Reminders (throughout the day)
const randomReminders = {
  gentle: [
    "🌟 Quick check-in: How's your MNZD progress today? Small steps count! 👣",
    "💡 Friendly reminder: Your future self will thank you for today's efforts! ✨",
    "🎯 Just a nudge: Which MNZD pillar could use some love right now? 💝",
    "⚡ Power moment: 5 minutes of progress beats zero minutes of perfection! 🚀",
    "🌱 Growth check: Every small action is building your stronger tomorrow! 💪",
  ],
  motivational: [
    "🔥 Your chain is waiting! Which pillar will you strengthen next? 💎",
    "🏆 Champions show up even when they don't feel like it. That's you! 👑",
    "⭐ Plot twist: Today's the day you surprise yourself with progress! 🎭",
    "🚀 Momentum builder: One MNZD task can shift your entire day! ⚡",
    "💪 Strength reminder: You've overcome 100% of your tough days so far! 🌟",
  ],
  encouraging: [
    "🤗 No pressure, just possibility: What feels achievable right now? 🌈",
    "💝 Self-care reminder: Progress over perfection, always! 🌸",
    "🌅 Fresh perspective: Every moment is a new chance to begin! ✨",
    "🎨 Creative nudge: How can you make MNZD fun today? 🎪",
    "🌊 Flow state: Sometimes the best progress happens naturally! 🍃",
  ],
};

// Inactivity-based messages
const inactivityMessages = {
  short: [
    // 2-3 hours inactive
    "👋 Just checking in! Your MNZD journey is still calling! 📞",
    "🌟 Gentle reminder: Small progress is still progress! 🐣",
    "💡 Quick thought: Which pillar feels most doable right now? 🤔",
  ],
  medium: [
    // 4-6 hours inactive
    "🔔 Friendly nudge: Your chain misses you! Ready to reconnect? 🔗",
    "⏰ Time check: A few minutes of MNZD can energize your day! ⚡",
    "🎯 Opportunity alert: Perfect moment for a quick win! 🏹",
  ],
  long: [
    // 6+ hours inactive
    "🌅 New chapter: Every moment is a fresh start for your habits! 📖",
    "💪 Comeback time: You've got this - one step at a time! 🚶‍♂️",
    "🔄 Reset mode: Today still has potential for progress! 🌟",
  ],
};

// Pattern-based messages (this was missing in the original code)
const patternMessages = {
  weekendWarrior: "🎉 Weekend warrior detected! You crush it on weekends! 💪",
  weekdayChamp: "💼 Weekday champion! Your work-life balance is inspiring! ⚖️",
  morningPerson:
    "🌅 Early bird catches the worm! Your morning game is strong! ☕",
  nightOwl: "🦉 Night owl productivity! You shine when others sleep! 🌙",
  consistentStar: "⭐ Mr./Ms. Consistent! Your steady rhythm is beautiful! 🎵",
  comebackKing: "👑 Comeback royalty! You bounce back like a champion! 🏀",
};

// Smart Notification Logic
export class NotificationService {
  private static lastActivity: number = Date.now();
  private static randomNotificationTimer: NodeJS.Timeout | null = null;

  // Track user activity
  static updateActivity(): void {
    this.lastActivity = Date.now();
  }

  // Get random reminder based on inactivity duration
  static getRandomReminder(inactiveHours: number): string {
    if (inactiveHours < 3) {
      const messages = [
        ...randomReminders.gentle,
        ...randomReminders.encouraging,
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    } else if (inactiveHours < 6) {
      const messages = [
        ...randomReminders.motivational,
        ...inactivityMessages.medium,
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    } else {
      const messages = [
        ...randomReminders.motivational,
        ...inactivityMessages.long,
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    }
  }

  // Start smart random notifications
  static startSmartReminders(): void {
    if (this.randomNotificationTimer) return;

    const checkInactivity = () => {
      const now = Date.now();
      const inactiveTime = now - this.lastActivity;
      const inactiveHours = inactiveTime / (1000 * 60 * 60);

      // Send random notification if inactive for 2+ hours
      if (inactiveHours >= 2) {
        const message = this.getRandomReminder(inactiveHours);
        this.sendNotification("🔗 Gentle Reminder", message);
        // Reset activity to avoid spam
        this.lastActivity = now;
      }

      // Random interval between 1-4 hours
      const nextCheck = Math.random() * 3 * 60 * 60 * 1000 + 60 * 60 * 1000;
      this.randomNotificationTimer = setTimeout(checkInactivity, nextCheck);
    };

    // Start first check after 2 hours
    this.randomNotificationTimer = setTimeout(
      checkInactivity,
      2 * 60 * 60 * 1000,
    );
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

    if (await this.requestPermission()) {
      const message = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
      
      // Send welcome notification immediately
      new Notification("🎆 Never Break The Chain", {
        body: message,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: "welcome-message",
        requireInteraction: true, // Keep it visible longer
        silent: false,
      });
    }
  }

  // Browser Notification API
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
      return permission === "granted";
    }

    return false;
  }

  static async sendNotification(
    title: string,
    message: string,
    icon?: string,
  ): Promise<void> {
    if (typeof window === "undefined") return;

    if (await this.requestPermission()) {
      new Notification(title, {
        body: message,
        icon: icon || "/favicon.ico",
        badge: "/favicon.ico",
        tag: "chain-reminder",
        requireInteraction: false,
        silent: false,
      });
    }
  }

  // Schedule notifications using browser's built-in scheduling
  static scheduleNotifications(progress: UserProgress): void {
    // Start smart random reminders
    this.startSmartReminders();

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
}

// Export for use in components
export default NotificationService;
