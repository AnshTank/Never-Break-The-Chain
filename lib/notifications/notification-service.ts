// Intelligent Notification System
export interface UserProgress {
  completed: number; // 0-4 MNZD tasks completed
  streak: number;
  timeOfDay: 'morning' | 'evening';
  patterns: {
    usualCompletionTime: string;
    strongestPillar: string;
    weakestPillar: string;
    weekdayPerformance: number;
    weekendPerformance: number;
  };
}

// Morning Motivational Messages (7 AM)
const morningMessages = {
  fresh: [
    "🌅 Rise and shine, chain builder! Today's link awaits your magic ✨",
    "☕ Coffee's brewing, goals are calling! Let's make today legendary 🚀",
    "🔥 Your future self is cheering you on. Time to make them proud!",
    "⚡ New day, new chance to be unstoppable. Your chain is hungry! 🍽️",
    "🎯 Champions don't wait for motivation - they create it. Let's go!"
  ],
  streak: [
    "🔥 {streak} days strong! You're on fire - don't let it cool down! 🌟",
    "💪 {streak} days of pure dedication! Your consistency is inspiring! ✨",
    "🚀 {streak} days and counting! You're building something beautiful! 🎨",
    "⭐ {streak} days of showing up! That's the spirit of a true champion! 🏆",
    "🌟 {streak} days of never giving up! Your chain is getting stronger! 💎"
  ]
};

// Evening Check-in Messages (Based on completion)
const eveningMessages = {
  allComplete: [
    "🎉 BOOM! All 4 pillars conquered! You're absolutely crushing it! 👑",
    "🏆 Perfect day achieved! Your dedication is next level! 🌟",
    "💎 4/4 complete! You just added a diamond link to your chain! ✨",
    "🚀 Mission accomplished! Your future self is doing a happy dance! 💃",
    "⚡ Flawless execution! You're the definition of unstoppable! 🔥"
  ],
  threeComplete: [
    "🌟 3/4 done! You're so close to perfection! One more push? 💪",
    "🎯 Amazing progress! Just one pillar left to make it legendary! ⭐",
    "🔥 3 pillars strong! Your {weakest} is calling for some love! 💝",
    "⚡ You're 75% there! Finish strong and own this day! 🚀",
    "💪 3 down, 1 to go! Champions finish what they start! 🏆"
  ],
  twoComplete: [
    "💪 Halfway hero! 2/4 complete - momentum is building! 🌊",
    "🎯 Good start! Your {strongest} game is strong! Keep the energy flowing! ⚡",
    "🌟 2 pillars standing tall! Time to rally and grab 2 more! 🚀",
    "🔥 You've got this! 2 down, 2 to go - balance is key! ⚖️",
    "💎 Solid foundation with 2/4! Let's build higher! 🏗️"
  ],
  oneComplete: [
    "🌱 Every journey starts with one step! 1/4 is progress! 🚶‍♂️",
    "💪 Your {strongest} pillar is solid! Time to strengthen the others! 🏗️",
    "⭐ 1 down, 3 to go! Small wins lead to big victories! 🎯",
    "🔥 You showed up! That's what separates winners from wishers! 🏆",
    "🌟 One pillar strong! Your chain is still alive - keep building! 🔗"
  ],
  noneComplete: [
    "🤗 Tough day? We all have them! Tomorrow is a fresh start! 🌅",
    "💝 Your chain isn't broken - it's just taking a breather! Rest and reset! 😴",
    "🌟 Even champions have off days! What matters is getting back up! 💪",
    "🔄 Reset button activated! Tomorrow you'll come back stronger! 🚀",
    "💎 Diamonds are made under pressure! This is your comeback story! ✨"
  ]
};

// Funny & Motivational Patterns
const patternMessages = {
  weekendWarrior: "🎉 Weekend warrior detected! You crush it on weekends! 💪",
  weekdayChamp: "💼 Weekday champion! Your work-life balance is inspiring! ⚖️",
  morningPerson: "🌅 Early bird catches the worm! Your morning game is strong! ☕",
  nightOwl: "🦉 Night owl productivity! You shine when others sleep! 🌙",
  consistentStar: "⭐ Mr./Ms. Consistent! Your steady rhythm is beautiful! 🎵",
  comebackKing: "👑 Comeback royalty! You bounce back like a champion! 🏀"
};

// Smart Notification Logic
export class NotificationService {
  static generateMorningMessage(progress: UserProgress): string {
    if (progress.streak > 7) {
      const message = morningMessages.streak[Math.floor(Math.random() * morningMessages.streak.length)];
      return message.replace('{streak}', progress.streak.toString());
    }
    return morningMessages.fresh[Math.floor(Math.random() * morningMessages.fresh.length)];
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
    message = message.replace('{weakest}', patterns.weakestPillar);
    message = message.replace('{strongest}', patterns.strongestPillar);
    
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
    if (patterns.usualCompletionTime < '12:00') {
      return patternMessages.morningPerson;
    }
    if (patterns.usualCompletionTime > '20:00') {
      return patternMessages.nightOwl;
    }
    
    return null;
  }

  // Browser Notification API
  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  static async sendNotification(title: string, message: string, icon?: string): Promise<void> {
    if (await this.requestPermission()) {
      new Notification(title, {
        body: message,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'chain-reminder',
        requireInteraction: false,
        silent: false
      });
    }
  }

  // Schedule notifications
  static scheduleNotifications(progress: UserProgress): void {
    // Morning notification (7 AM)
    const morningTime = new Date();
    morningTime.setHours(7, 0, 0, 0);
    
    if (morningTime < new Date()) {
      morningTime.setDate(morningTime.getDate() + 1);
    }

    const morningDelay = morningTime.getTime() - new Date().getTime();
    setTimeout(() => {
      const message = this.generateMorningMessage(progress);
      this.sendNotification('🔗 Never Break The Chain', message);
    }, morningDelay);

    // Evening check-in (8 PM)
    const eveningTime = new Date();
    eveningTime.setHours(20, 0, 0, 0);
    
    if (eveningTime < new Date()) {
      eveningTime.setDate(eveningTime.getDate() + 1);
    }

    const eveningDelay = eveningTime.getTime() - new Date().getTime();
    setTimeout(() => {
      const message = this.generateEveningMessage(progress);
      this.sendNotification('🎯 Daily Check-in', message);
      
      // Add pattern message if available
      const patternMsg = this.getPatternMessage(progress);
      if (patternMsg) {
        setTimeout(() => {
          this.sendNotification('🧠 Smart Insight', patternMsg);
        }, 5000);
      }
    }, eveningDelay);
  }
}

// Export for use in components
export default NotificationService;