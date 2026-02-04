// Streak Recovery Email Template
export function getStreakRecoveryTemplate(data: {
  userName: string;
  userEmail: string;
  previousStreak: number;
  daysBroken: number;
  actionUrl: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Comeback Time - Never Break The Chain</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
          <div style="margin-bottom: 20px;">
            <span style="font-size: 48px;">🌱</span>
          </div>
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Comeback Time!</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Every champion has comeback stories</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #1e293b; margin: 0 0 20px; font-size: 24px;">Hi ${data.userName}! 💪</h2>
          
          <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Your ${data.previousStreak}-day streak was incredible! ${data.daysBroken} days off doesn't erase that achievement. 
            Champions don't stay down - they get back up stronger.
          </p>
          
          <!-- Stats Card -->
          <div style="background: #f0fdf4; border: 2px solid #10b981; border-radius: 12px; padding: 24px; margin: 30px 0;">
            <h3 style="color: #065f46; margin: 0 0 16px; font-size: 18px;">🏆 Your Strength</h3>
            <ul style="color: #065f46; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
              <li><strong>Previous Best:</strong> ${data.previousStreak} days (that's real!)</li>
              <li><strong>Proven Ability:</strong> You've done it before</li>
              <li><strong>Fresh Start:</strong> Today is Day 1 of your comeback</li>
              <li><strong>Next Milestone:</strong> Just 3 days to STARTER STRONG</li>
            </ul>
          </div>
          
          <!-- Motivation -->
          <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
            <p style="color: #92400e; margin: 0; font-size: 14px; font-style: italic;">
              💡 "Success is not final, failure is not fatal: it is the courage to continue that counts." - Winston Churchill
            </p>
          </div>
          
          <!-- CTA -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.actionUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
              🚀 Start My Comeback
            </a>
          </div>
          
          <!-- Recovery Tips -->
          <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <h3 style="color: #334155; margin: 0 0 12px; font-size: 16px; font-weight: 600;">
              🎯 Comeback Strategy
            </h3>
            <ul style="color: #64748b; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
              <li>Start with just ONE habit today</li>
              <li>Focus on consistency over perfection</li>
              <li>Remember: you've proven you can do this</li>
              <li>Your ${data.previousStreak}-day streak is your proof of capability</li>
            </ul>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; margin: 0 0 16px; font-size: 14px;">
            Your comeback story starts with a single step. Take it today! 🌟
          </p>
          <p style="color: #94a3b8; margin: 0; font-size: 12px;">
            © 2026 Never Break The Chain by Ansh Tank. Champions never quit! 🏆
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}