// Enhanced Email Templates for Never Break The Chain - 2026
// Production-ready, scalable email templates with modern design

export interface EmailTemplateData {
  userName: string;
  userEmail: string;
  streakCount?: number;
  completedToday?: number;
  totalHabits?: number;
  motivationalMessage?: string;
  actionUrl?: string;
  unsubscribeUrl?: string;
}

// Base template wrapper for consistent branding
const getBaseTemplate = (content: string, title: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; line-height: 1.6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 32px 24px; text-align: center;">
      <div style="margin-bottom: 16px;">
        <span style="font-size: 32px; display: inline-block;">🔗</span>
      </div>
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
        Never Break The Chain
      </h1>
      <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0; font-size: 14px;">
        Your Daily Habit Companion
      </p>
    </div>
    
    <!-- Content -->
    ${content}
    
    <!-- Footer -->
    <div style="background: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
      <div style="margin-bottom: 16px;">
        <a href="https://never-break-the-chain.vercel.app" style="color: #f59e0b; text-decoration: none; font-weight: 500; font-size: 14px;">
          📱 Open Dashboard
        </a>
        <span style="color: #94a3b8; margin: 0 12px;">•</span>
        <a href="mailto:anshtank9@gmail.com" style="color: #f59e0b; text-decoration: none; font-weight: 500; font-size: 14px;">
          💬 Support
        </a>
      </div>
      <p style="color: #64748b; margin: 0 0 8px; font-size: 12px;">
        Built with ❤️ by Ansh Tank | Parul University
      </p>
      <p style="color: #94a3b8; margin: 0; font-size: 12px;">
        © 2026 Never Break The Chain. Transform your habits, transform your life! 🚀
      </p>
    </div>
  </div>
</body>
</html>
`;

// Morning Motivation Email Template
export const getMorningMotivationTemplate = (data: EmailTemplateData): string => {
  const content = `
    <div style="padding: 32px 24px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="font-size: 48px; margin-bottom: 16px;">🌅</div>
        <h2 style="color: #1e293b; margin: 0 0 8px; font-size: 28px; font-weight: 700;">
          Good Morning, ${data.userName}!
        </h2>
        <p style="color: #64748b; margin: 0; font-size: 16px;">
          Ready to make today count? Your chain is waiting! ⛓️
        </p>
      </div>
      
      <!-- Streak Display -->
      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; border-radius: 16px; padding: 24px; margin: 24px 0; text-align: center;">
        <div style="font-size: 48px; font-weight: 800; color: #d97706; margin-bottom: 8px;">
          ${data.streakCount || 0}
        </div>
        <p style="color: #92400e; margin: 0; font-size: 16px; font-weight: 600;">
          Days Tracked 📅
        </p>
        <p style="color: #a16207; margin: 8px 0 0; font-size: 14px;">
          Progress: ${data.completedToday || 0}/${data.totalHabits || 4} tasks
        </p>
      </div>
      
      <!-- Motivational Message -->
      <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 24px 0;">
        <p style="color: #0369a1; margin: 0; font-size: 16px; font-style: italic; text-align: center;">
          "${data.motivationalMessage || `Today is day ${data.streakCount || 1} of your journey. Every task completed brings you closer to your goals!`}"
        </p>
      </div>
      
      <!-- MNZD Pillars -->
      <div style="margin: 32px 0;">
        <h3 style="color: #1e293b; margin: 0 0 16px; font-size: 18px; font-weight: 600; text-align: center;">
          🎯 Today's MNZD Focus
        </h3>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
          <div style="background: #f0fdf4; border: 1px solid #10b981; border-radius: 8px; padding: 16px; text-align: center;">
            <div style="font-size: 24px; margin-bottom: 8px;">🧘</div>
            <div style="color: #065f46; font-size: 14px; font-weight: 600;">Meditation</div>
          </div>
          <div style="background: #eff6ff; border: 1px solid #3b82f6; border-radius: 8px; padding: 16px; text-align: center;">
            <div style="font-size: 24px; margin-bottom: 8px;">📚</div>
            <div style="color: #1e40af; font-size: 14px; font-weight: 600;">Nutrition</div>
          </div>
          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; text-align: center;">
            <div style="font-size: 24px; margin-bottom: 8px;">💪</div>
            <div style="color: #92400e; font-size: 14px; font-weight: 600;">Zone</div>
          </div>
          <div style="background: #f3e8ff; border: 1px solid #8b5cf6; border-radius: 8px; padding: 16px; text-align: center;">
            <div style="font-size: 24px; margin-bottom: 8px;">🎯</div>
            <div style="color: #6b21a8; font-size: 14px; font-weight: 600;">Discipline</div>
          </div>
        </div>
      </div>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${data.actionUrl || 'https://never-break-the-chain.vercel.app/dashboard'}" 
           style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);">
          🚀 Start Today's Habits
        </a>
      </div>
    </div>
  `;
  
  return getBaseTemplate(content, "🌅 Good Morning - Never Break The Chain");
};

// Evening Check-in Email Template
export const getEveningCheckinTemplate = (data: EmailTemplateData): string => {
  const completionRate = data.totalHabits ? Math.round((data.completedToday || 0) / data.totalHabits * 100) : 0;
  
  const content = `
    <div style="padding: 32px 24px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="font-size: 48px; margin-bottom: 16px;">🌙</div>
        <h2 style="color: #1e293b; margin: 0 0 8px; font-size: 28px; font-weight: 700;">
          Evening Reflection, ${data.userName}
        </h2>
        <p style="color: #64748b; margin: 0; font-size: 16px;">
          How did your habits go today? Let's check in! ✨
        </p>
      </div>
      
      <!-- Progress Circle -->
      <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px solid #0ea5e9; border-radius: 16px; padding: 32px; margin: 24px 0; text-align: center;">
        <div style="position: relative; display: inline-block; margin-bottom: 16px;">
          <div style="font-size: 64px; font-weight: 800; color: #0369a1;">
            ${completionRate}%
          </div>
        </div>
        <p style="color: #0369a1; margin: 0; font-size: 18px; font-weight: 600;">
          Today's Completion Rate
        </p>
        <p style="color: #0284c7; margin: 8px 0 0; font-size: 14px;">
          ${data.completedToday || 0}/${data.totalHabits || 4} tasks completed
        </p>
        <p style="color: #0284c7; margin: 4px 0 0; font-size: 12px;">
          Day ${data.streakCount || 1} tracked
        </p>
      </div>
      
      <!-- Encouragement Message -->
      <div style="background: ${completionRate >= 80 ? '#f0fdf4' : completionRate >= 50 ? '#fef3c7' : '#fef2f2'}; border-left: 4px solid ${completionRate >= 80 ? '#10b981' : completionRate >= 50 ? '#f59e0b' : '#ef4444'}; border-radius: 8px; padding: 20px; margin: 24px 0;">
        <p style="color: ${completionRate >= 80 ? '#065f46' : completionRate >= 50 ? '#92400e' : '#991b1b'}; margin: 0; font-size: 16px; text-align: center;">
          ${completionRate >= 80 
            ? `🎉 Outstanding! ${data.completedToday}/${data.totalHabits} tasks done on day ${data.streakCount || 1}. You're building incredible momentum!` 
            : completionRate >= 50 
            ? `💪 Good progress! ${data.completedToday}/${data.totalHabits} tasks completed. Every step counts on day ${data.streakCount || 1}!` 
            : `🌱 Day ${data.streakCount || 1}: ${data.completedToday}/${data.totalHabits} tasks done. Tomorrow is a fresh start!`}
        </p>
      </div>
      
      <!-- Tomorrow's Preparation -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <h3 style="color: #1e293b; margin: 0 0 16px; font-size: 18px; font-weight: 600; text-align: center;">
          🎯 Prepare for Tomorrow
        </h3>
        <ul style="color: #64748b; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
          <li>Review today's wins and lessons learned</li>
          <li>Set intentions for tomorrow's habits</li>
          <li>Prepare your environment for success</li>
          <li>Get quality sleep to fuel your next day</li>
        </ul>
      </div>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${data.actionUrl || 'https://never-break-the-chain.vercel.app/dashboard'}" 
           style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);">
          📊 View Full Progress
        </a>
      </div>
    </div>
  `;
  
  return getBaseTemplate(content, "🌙 Evening Check-in - Never Break The Chain");
};

// Milestone Achievement Email Template
export const getMilestoneTemplate = (data: EmailTemplateData): string => {
  const milestoneEmojis = {
    7: "🎯", 14: "🔥", 30: "💎", 60: "🏆", 100: "👑", 365: "🌟"
  };
  
  const getMilestoneEmoji = (streak: number) => {
    if (streak >= 365) return "🌟";
    if (streak >= 100) return "👑";
    if (streak >= 60) return "🏆";
    if (streak >= 30) return "💎";
    if (streak >= 14) return "🔥";
    if (streak >= 7) return "🎯";
    return "✨";
  };
  
  const content = `
    <div style="padding: 32px 24px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="font-size: 64px; margin-bottom: 16px;">${getMilestoneEmoji(data.streakCount || 0)}</div>
        <h2 style="color: #1e293b; margin: 0 0 8px; font-size: 32px; font-weight: 800;">
          MILESTONE ACHIEVED!
        </h2>
        <p style="color: #64748b; margin: 0; font-size: 18px;">
          Congratulations ${data.userName}, you've reached an incredible milestone! 🎉
        </p>
      </div>
      
      <!-- Achievement Badge -->
      <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%); border-radius: 20px; padding: 40px; margin: 32px 0; text-align: center; box-shadow: 0 8px 32px rgba(245, 158, 11, 0.3);">
        <div style="background: rgba(255, 255, 255, 0.2); border-radius: 50%; width: 120px; height: 120px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; border: 3px solid rgba(255, 255, 255, 0.3);">
          <div style="font-size: 72px; font-weight: 900; color: #ffffff;">
            ${data.streakCount}
          </div>
        </div>
        <h3 style="color: #ffffff; margin: 0 0 8px; font-size: 24px; font-weight: 700;">
          ${data.streakCount} Day Streak!
        </h3>
        <p style="color: rgba(255, 255, 255, 0.9); margin: 0; font-size: 16px;">
          You've officially built a life-changing habit! 🚀
        </p>
      </div>
      
      <!-- Achievement Stats -->
      <div style="background: #f8fafc; border-radius: 16px; padding: 24px; margin: 24px 0;">
        <h3 style="color: #1e293b; margin: 0 0 20px; font-size: 20px; font-weight: 600; text-align: center;">
          📈 Your Journey So Far
        </h3>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
          <div style="text-align: center; padding: 16px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0;">
            <div style="font-size: 32px; font-weight: 700; color: #f59e0b; margin-bottom: 4px;">
              ${data.streakCount}
            </div>
            <div style="color: #64748b; font-size: 14px;">Consecutive Days</div>
          </div>
          <div style="text-align: center; padding: 16px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0;">
            <div style="font-size: 32px; font-weight: 700; color: #10b981; margin-bottom: 4px;">
              ${Math.round((data.streakCount || 0) * 2.5)}
            </div>
            <div style="color: #64748b; font-size: 14px;">Hours Invested</div>
          </div>
        </div>
      </div>
      
      <!-- Inspirational Quote -->
      <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 4px solid #0ea5e9; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
        <p style="color: #0369a1; margin: 0 0 12px; font-size: 18px; font-style: italic; font-weight: 500;">
          "We are what we repeatedly do. Excellence, then, is not an act, but a habit."
        </p>
        <p style="color: #0284c7; margin: 0; font-size: 14px;">
          — Aristotle
        </p>
      </div>
      
      <!-- Next Milestone -->
      <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
        <h4 style="color: #92400e; margin: 0 0 8px; font-size: 16px; font-weight: 600;">
          🎯 Next Milestone
        </h4>
        <p style="color: #a16207; margin: 0; font-size: 14px;">
          ${data.streakCount && data.streakCount < 365 
            ? `Only ${data.streakCount < 30 ? 30 - data.streakCount : data.streakCount < 100 ? 100 - data.streakCount : 365 - data.streakCount} more days to your next major milestone!`
            : "You've reached the ultimate milestone! Keep going for life transformation!"}
        </p>
      </div>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${data.actionUrl || 'https://never-break-the-chain.vercel.app/dashboard'}" 
           style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; text-decoration: none; padding: 18px 36px; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);">
          🎉 Celebrate & Continue
        </a>
      </div>
    </div>
  `;
  
  return getBaseTemplate(content, `🎉 ${data.streakCount} Day Milestone - Never Break The Chain`);
};

// Streak Recovery Email Template
export const getStreakRecoveryTemplate = (data: EmailTemplateData): string => {
  const content = `
    <div style="padding: 32px 24px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="font-size: 48px; margin-bottom: 16px;">🌱</div>
        <h2 style="color: #1e293b; margin: 0 0 8px; font-size: 28px; font-weight: 700;">
          Fresh Start, ${data.userName}!
        </h2>
        <p style="color: #64748b; margin: 0; font-size: 16px;">
          Every master was once a beginner. Your comeback starts now! 💪
        </p>
      </div>
      
      <!-- Encouragement Message -->
      <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 2px solid #10b981; border-radius: 16px; padding: 32px; margin: 24px 0; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 16px;">🔄</div>
        <h3 style="color: #065f46; margin: 0 0 12px; font-size: 22px; font-weight: 700;">
          Setbacks Are Setups for Comebacks
        </h3>
        <p style="color: #047857; margin: 0; font-size: 16px; line-height: 1.6;">
          Missing a day doesn't erase your progress. It's not about perfection—it's about persistence. 
          Today is your opportunity to restart stronger than before!
        </p>
      </div>
      
      <!-- Recovery Strategy -->
      <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <h3 style="color: #1e293b; margin: 0 0 20px; font-size: 20px; font-weight: 600; text-align: center;">
          🎯 Your Recovery Game Plan
        </h3>
        <div style="space-y: 16px;">
          <div style="display: flex; align-items: flex-start; margin-bottom: 16px;">
            <div style="background: #10b981; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; margin-right: 12px; flex-shrink: 0;">1</div>
            <div>
              <h4 style="color: #1e293b; margin: 0 0 4px; font-size: 16px; font-weight: 600;">Start Small Today</h4>
              <p style="color: #64748b; margin: 0; font-size: 14px;">Pick just one habit and commit to 5 minutes. Build momentum gradually.</p>
            </div>
          </div>
          <div style="display: flex; align-items: flex-start; margin-bottom: 16px;">
            <div style="background: #10b981; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; margin-right: 12px; flex-shrink: 0;">2</div>
            <div>
              <h4 style="color: #1e293b; margin: 0 0 4px; font-size: 16px; font-weight: 600;">Focus on Systems</h4>
              <p style="color: #64748b; margin: 0; font-size: 14px;">Create an environment that makes good habits easier and bad habits harder.</p>
            </div>
          </div>
          <div style="display: flex; align-items: flex-start; margin-bottom: 16px;">
            <div style="background: #10b981; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; margin-right: 12px; flex-shrink: 0;">3</div>
            <div>
              <h4 style="color: #1e293b; margin: 0 0 4px; font-size: 16px; font-weight: 600;">Track Progress</h4>
              <p style="color: #64748b; margin: 0; font-size: 14px;">Use your dashboard to monitor daily wins and build visual momentum.</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Motivational Quote -->
      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
        <p style="color: #92400e; margin: 0 0 12px; font-size: 18px; font-style: italic; font-weight: 500;">
          "Success is not final, failure is not fatal: it is the courage to continue that counts."
        </p>
        <p style="color: #a16207; margin: 0; font-size: 14px;">
          — Winston Churchill
        </p>
      </div>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${data.actionUrl || 'https://never-break-the-chain.vercel.app/dashboard'}" 
           style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
          🚀 Restart My Journey
        </a>
      </div>
    </div>
  `;
  
  return getBaseTemplate(content, "🌱 Fresh Start - Never Break The Chain");
};

// Weekly Summary Email Template
export const getWeeklySummaryTemplate = (data: EmailTemplateData & { 
  weeklyStats: { 
    daysCompleted: number; 
    totalDays: number; 
    topHabit: string; 
    improvementArea: string;
  } 
}): string => {
  const completionRate = Math.round((data.weeklyStats.daysCompleted / data.weeklyStats.totalDays) * 100);
  
  const content = `
    <div style="padding: 32px 24px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
        <h2 style="color: #1e293b; margin: 0 0 8px; font-size: 28px; font-weight: 700;">
          Weekly Summary
        </h2>
        <p style="color: #64748b; margin: 0; font-size: 16px;">
          Here's how your week went, ${data.userName}! 📈
        </p>
      </div>
      
      <!-- Weekly Stats -->
      <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 16px; padding: 32px; margin: 24px 0;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="font-size: 64px; font-weight: 800; color: #0369a1; margin-bottom: 8px;">
            ${completionRate}%
          </div>
          <p style="color: #0369a1; margin: 0; font-size: 18px; font-weight: 600;">
            Weekly Completion Rate
          </p>
          <p style="color: #0284c7; margin: 8px 0 0; font-size: 14px;">
            ${data.weeklyStats.daysCompleted} out of ${data.weeklyStats.totalDays} days completed
          </p>
        </div>
        
        <!-- Week Visualization -->
        <div style="display: flex; justify-content: center; gap: 4px; margin-top: 20px;">
          ${Array.from({ length: 7 }, (_, i) => `
            <div style="width: 32px; height: 32px; border-radius: 6px; background-color: ${i < data.weeklyStats.daysCompleted ? '#10b981' : '#e5e7eb'}; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: 600;">
              ${i + 1}
            </div>
          `).join('')}
        </div>
      </div>
      
      <!-- Insights -->
      <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <h3 style="color: #1e293b; margin: 0 0 20px; font-size: 20px; font-weight: 600; text-align: center;">
          📈 Weekly Insights
        </h3>
        <div style="display: grid; grid-template-columns: 1fr; gap: 16px;">
          <div style="background: #f0fdf4; border: 1px solid #10b981; border-radius: 8px; padding: 16px;">
            <h4 style="color: #065f46; margin: 0 0 8px; font-size: 16px; font-weight: 600;">
              🏆 Top Performing Habit
            </h4>
            <p style="color: #047857; margin: 0; font-size: 14px;">
              ${data.weeklyStats.topHabit} - Keep up the excellent work!
            </p>
          </div>
          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px;">
            <h4 style="color: #92400e; margin: 0 0 8px; font-size: 16px; font-weight: 600;">
              🎯 Growth Opportunity
            </h4>
            <p style="color: #a16207; margin: 0; font-size: 14px;">
              ${data.weeklyStats.improvementArea} - Small improvements here will make a big difference!
            </p>
          </div>
        </div>
      </div>
      
      <!-- Next Week Goals -->
      <div style="background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%); border: 2px solid #8b5cf6; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <h3 style="color: #6b21a8; margin: 0 0 16px; font-size: 20px; font-weight: 600; text-align: center;">
          🎯 Next Week's Focus
        </h3>
        <ul style="color: #7c3aed; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
          <li>Aim for ${Math.min(completionRate + 10, 100)}% completion rate</li>
          <li>Focus extra attention on ${data.weeklyStats.improvementArea}</li>
          <li>Maintain momentum in ${data.weeklyStats.topHabit}</li>
          <li>Add one small improvement to your routine</li>
        </ul>
      </div>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${data.actionUrl || 'https://never-break-the-chain.vercel.app/dashboard'}" 
           style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);">
          📊 View Detailed Analytics
        </a>
      </div>
    </div>
  `;
  
  return getBaseTemplate(content, "📊 Weekly Summary - Never Break The Chain");
};