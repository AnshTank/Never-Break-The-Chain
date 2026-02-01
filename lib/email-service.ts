import nodemailer from "nodemailer";

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  connectionTimeout: 60000,
  greetingTimeout: 30000,
  socketTimeout: 60000,
  tls: {
    rejectUnauthorized: false
  }
});

// Generate 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP email
export async function sendOTPEmail(
  email: string,
  otp: string,
  type: "verification" | "reset",
): Promise<boolean> {
  try {
    // Quick connection test with shorter timeout
    const testTransporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 5000, // 5 seconds
      socketTimeout: 10000, // 10 seconds
    });
    
    await testTransporter.verify();
    
    const sanitizedEmail = sanitizeEmailInput(email);
    const sanitizedOTP = otp.replace(/[^0-9]/g, "");

    if (sanitizedOTP.length !== 6) {
      console.error("Invalid OTP format");
      return false;
    }

    const subject =
      type === "verification"
        ? "🔗 Verify Your Email - Never Break The Chain"
        : "🔑 Reset Your Password - Never Break The Chain";
    const purpose =
      type === "verification"
        ? "verify your email address"
        : "reset your password";
    const actionText =
      type === "verification"
        ? "Welcome aboard!"
        : "Let's get you back on track!";

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: sanitizedEmail,
      subject,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center;">
              <div style="margin-bottom: 20px;">
                <span style="font-size: 36px;">🔗</span>
              </div>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                Never Break The Chain
              </h1>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0; font-size: 16px;">
                ${actionText}
              </p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <div style="text-align: center; margin-bottom: 40px;">
                <h2 style="color: #1e293b; margin: 0 0 16px; font-size: 24px; font-weight: 600;">
                  Your verification code
                </h2>
                <p style="color: #64748b; margin: 0; font-size: 16px; line-height: 1.5;">
                  Enter this code to ${purpose}:
                </p>
              </div>
              
              <!-- OTP Code -->
              <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
                <div style="font-size: 36px; font-weight: 700; color: #f59e0b; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                  ${sanitizedOTP}
                </div>
              </div>
              
              <!-- Expiry Warning -->
              <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 16px; margin: 30px 0; text-align: center;">
                <p style="color: #92400e; margin: 0; font-size: 14px; font-weight: 500;">
                  ⏰ This code expires in 5 minutes
                </p>
              </div>
              
              <!-- Help Section -->
              <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <h3 style="color: #334155; margin: 0 0 12px; font-size: 16px; font-weight: 600;">
                  Didn't receive the email?
                </h3>
                <ul style="color: #64748b; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
                  <li>Check your spam/junk folder</li>
                  <li>Make sure ${sanitizedEmail} is correct</li>
                  <li>Try requesting a new code</li>
                  <li>Contact our support team if issues persist</li>
                </ul>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; margin: 0 0 16px; font-size: 14px;">
                If you didn't request this code, please ignore this email.
              </p>
              <div style="margin: 20px 0;">
                <a href="mailto:anshtank9@gmail.com" style="color: #f59e0b; text-decoration: none; font-size: 14px; font-weight: 500;">
                  Need help? Contact Support
                </a>
              </div>
              <p style="color: #94a3b8; margin: 0; font-size: 12px;">
                © 2024 Never Break The Chain. Keep building your habits! 🚀
              </p>
            </div>
          </div>
          
          <!-- Unsubscribe -->
          <div style="text-align: center; margin: 20px 0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              This is a transactional email for account security.
            </p>
          </div>
        </body>
        </html>
      `,
    };

    await testTransporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Email send error:", error);
    
    // Check if it's a connection timeout
    if ((error as any).code === 'ESOCKET' || (error as any).code === 'ETIMEDOUT') {
      console.error('Gmail SMTP connection timeout - network or rate limiting issue');
    }
    
    return false;
  }
}

// Send contact form email to admin
export async function sendContactEmail(
  name: string,
  email: string,
  subject: string,
  message: string,
): Promise<boolean> {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.ADMIN_EMAIL,
      subject: `🆘 Support Request: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Support Request</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center;">
              <div style="margin-bottom: 16px;">
                <span style="font-size: 24px;">🆘</span>
              </div>
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">
                New Support Request
              </h1>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0; font-size: 14px;">
                Never Break The Chain - User Support
              </p>
            </div>
            
            <!-- Content -->
            <div style="padding: 30px;">
              <!-- User Info -->
              <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <h3 style="color: #1e293b; margin: 0 0 16px; font-size: 18px; font-weight: 600;">
                  User Information
                </h3>
                <div style="display: grid; gap: 12px;">
                  <div>
                    <strong style="color: #374151;">Name:</strong>
                    <span style="color: #6b7280; margin-left: 8px;">${name}</span>
                  </div>
                  <div>
                    <strong style="color: #374151;">Email:</strong>
                    <span style="color: #6b7280; margin-left: 8px;">${email}</span>
                  </div>
                  <div>
                    <strong style="color: #374151;">Subject:</strong>
                    <span style="color: #6b7280; margin-left: 8px;">${subject}</span>
                  </div>
                  <div>
                    <strong style="color: #374151;">Timestamp:</strong>
                    <span style="color: #6b7280; margin-left: 8px;">${new Date().toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <!-- Message -->
              <div style="margin-bottom: 24px;">
                <h3 style="color: #1e293b; margin: 0 0 16px; font-size: 18px; font-weight: 600;">
                  Message
                </h3>
                <div style="background: #ffffff; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px;">
                  <p style="color: #374151; margin: 0; line-height: 1.6; white-space: pre-wrap;">${message}</p>
                </div>
              </div>
              
              <!-- Quick Actions -->
              <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px;">
                <h3 style="color: #0369a1; margin: 0 0 12px; font-size: 16px; font-weight: 600;">
                  🚀 Quick Actions
                </h3>
                <ul style="color: #0369a1; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
                  <li>Reply directly to this email to respond to the user</li>
                  <li>Expected response time: Within 24 hours</li>
                  <li>Priority: ${subject.toLowerCase().includes("urgent") || subject.toLowerCase().includes("critical") ? "HIGH" : "NORMAL"}</li>
                </ul>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; margin: 0; font-size: 12px;">
                This support request was sent from Never Break The Chain app.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      replyTo: email, // Allow direct reply to user
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Contact email send error:", error);
    return false;
  }
}

// Send about contact form email to admin
export async function sendAboutContactEmail(
  name: string,
  email: string,
  subject: string,
  message: string,
): Promise<boolean> {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.ADMIN_EMAIL,
      subject: `📖 About Page Contact: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>About Page Contact</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Merriweather', serif; background-color: #f8f6f0;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #f8f6f0; padding: 20px;">
            
            <!-- Header -->
            <div style="background: #2c5aa0; color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; box-shadow: 4px 4px 0 #1e3a8a;">
              <h1 style="margin: 0; font-family: 'Caveat', cursive; font-size: 32px; font-weight: 700;">
                📖 Never Break The Chain
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.9;">
                About Page Contact Form
              </p>
            </div>
            
            <!-- Content -->
            <div style="background: white; padding: 40px; border: 2px solid #2c5aa0; border-top: none; box-shadow: 4px 4px 0 #2c5aa0;">
              
              <!-- Contact Details Card -->
              <div style="background: #f0f4f8; padding: 24px; border-radius: 12px; margin-bottom: 24px; border-left: 6px solid #2c5aa0; box-shadow: 2px 2px 0 #e2e8f0;">
                <h3 style="color: #2c5aa0; margin-top: 0; font-family: 'Caveat', cursive; font-size: 24px; margin-bottom: 16px;">
                  ✨ Contact Details
                </h3>
                <div style="display: grid; gap: 12px;">
                  <p style="margin: 0; font-size: 16px;"><strong style="color: #1e3a8a;">👤 Name:</strong> <span style="color: #374151;">${name}</span></p>
                  <p style="margin: 0; font-size: 16px;"><strong style="color: #1e3a8a;">📧 Email:</strong> <span style="color: #374151;">${email}</span></p>
                  <p style="margin: 0; font-size: 16px;"><strong style="color: #1e3a8a;">📝 Subject:</strong> <span style="color: #374151;">${subject}</span></p>
                  <p style="margin: 0; font-size: 14px;"><strong style="color: #1e3a8a;">🕒 Time:</strong> <span style="color: #6b7280;">${new Date().toLocaleString()}</span></p>
                </div>
              </div>
              
              <!-- Message Card -->
              <div style="background: #ffffff; padding: 24px; border: 2px solid #2c5aa0; border-radius: 12px; box-shadow: 4px 4px 0 #2c5aa0; margin-bottom: 24px;">
                <h3 style="color: #2c5aa0; margin-top: 0; font-family: 'Caveat', cursive; font-size: 24px; margin-bottom: 16px;">
                  💬 Message
                </h3>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                  <p style="line-height: 1.7; white-space: pre-wrap; color: #374151; margin: 0; font-size: 16px;">${message}</p>
                </div>
              </div>
              
              <!-- Action Items -->
              <div style="background: linear-gradient(135deg, #e3f2fd 0%, #f0f9ff 100%); padding: 20px; border-radius: 12px; border: 1px solid #0ea5e9;">
                <h3 style="color: #0369a1; margin-top: 0; font-family: 'Caveat', cursive; font-size: 20px; margin-bottom: 12px;">
                  🎯 Next Steps
                </h3>
                <ul style="color: #0369a1; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
                  <li>📧 Reply directly to respond to ${name}</li>
                  <li>⏰ Target response: Within 24 hours</li>
                  <li>🔗 Source: About page contact form</li>
                  <li>📊 Priority: ${subject.toLowerCase().includes('urgent') || subject.toLowerCase().includes('important') ? 'HIGH 🔥' : 'NORMAL 📝'}</li>
                </ul>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #f8f6f0; padding: 24px; text-align: center; border: 2px solid #2c5aa0; border-top: none; border-radius: 0 0 12px 12px; box-shadow: 4px 4px 0 #2c5aa0;">
              <p style="margin: 0; font-size: 14px; color: #6b7280; font-family: 'Space Mono', monospace;">
                📧 Sent from Never Break The Chain About Page<br>
                🕒 ${new Date().toLocaleString()} | 🎨 Vintage Theme
              </p>
              <div style="margin-top: 16px; padding-top: 16px; border-top: 1px dashed #d1d5db;">
                <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                  Built with ❤️ by Ansh Tank | Never Break The Chain
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      replyTo: email,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("About contact email send error:", error);
    return false;
  }
}

// Send welcome flow reminder email
export async function sendWelcomeFlowReminder(
  name: string,
  email: string
): Promise<boolean> {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "🌟 Complete Your Journey Setup - Never Break The Chain",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Complete Your Setup</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center;">
              <div style="margin-bottom: 20px;">
                <span style="font-size: 36px;">🌟</span>
              </div>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                Your Chain Awaits!
              </h1>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0; font-size: 16px;">
                Complete your setup and start building habits
              </p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #1e293b; margin: 0 0 16px; font-size: 24px; font-weight: 600;">
                  Hi ${name}! 👋
                </h2>
                <p style="color: #64748b; margin: 0; font-size: 16px; line-height: 1.6;">
                  We noticed you verified your email but haven't completed your welcome setup yet. 
                  Your transformation journey is just one step away!
                </p>
              </div>
              
              <!-- What's Waiting -->
              <div style="background: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 12px; padding: 24px; margin: 30px 0;">
                <h3 style="color: #0369a1; margin: 0 0 16px; font-size: 18px; font-weight: 600;">
                  🚀 What's waiting for you:
                </h3>
                <ul style="color: #0369a1; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
                  <li><strong>MNZD Methodology</strong> - Learn the 4 pillars of success</li>
                  <li><strong>Personalized Dashboard</strong> - Track your daily progress</li>
                  <li><strong>Smart Analytics</strong> - Visualize your habit chains</li>
                  <li><strong>Achievement System</strong> - Celebrate every milestone</li>
                </ul>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://never-break-the-chain-anshtank.vercel.app/login" 
                   style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3); transition: all 0.3s ease;">
                  🔗 Complete My Setup
                </a>
              </div>
              
              <!-- Motivation -->
              <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
                <p style="color: #92400e; margin: 0; font-size: 14px; font-style: italic;">
                  💡 "We are what we repeatedly do. Excellence, then, is not an act, but a habit." - Aristotle
                </p>
              </div>
              
              <!-- Help Section -->
              <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <h3 style="color: #334155; margin: 0 0 12px; font-size: 16px; font-weight: 600;">
                  Need help getting started?
                </h3>
                <p style="color: #64748b; margin: 0; font-size: 14px; line-height: 1.6;">
                  Simply click the button above to log in and complete your welcome flow. 
                  It takes less than 2 minutes to set up your personalized habit tracking experience!
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; margin: 0 0 16px; font-size: 14px;">
                Ready to transform your habits? Your future self will thank you! 🌟
              </p>
              <div style="margin: 20px 0;">
                <a href="mailto:anshtank9@gmail.com" style="color: #f59e0b; text-decoration: none; font-size: 14px; font-weight: 500;">
                  Questions? Contact Support
                </a>
              </div>
              <p style="color: #94a3b8; margin: 0; font-size: 12px;">
                © 2024 Never Break The Chain by Ansh Tank. Start your transformation today! 🚀
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Welcome flow reminder email error:", error);
    return false;
  }
}
export async function sendNewUserNotification(
  name: string,
  email: string,
  joinTime: Date
): Promise<boolean> {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: "neverbreakthechain.anshtank@gmail.com",
      subject: "🎉 New User Joined - Never Break The Chain",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New User Notification</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
              <div style="margin-bottom: 16px;">
                <span style="font-size: 32px;">🎉</span>
              </div>
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">
                New User Joined!
              </h1>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0; font-size: 14px;">
                Never Break The Chain - User Registration
              </p>
            </div>
            
            <!-- Content -->
            <div style="padding: 30px;">
              <!-- User Info -->
              <div style="background: #f0fdf4; border: 2px solid #10b981; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <h3 style="color: #065f46; margin: 0 0 16px; font-size: 18px; font-weight: 600;">
                  👤 User Details
                </h3>
                <div style="display: grid; gap: 12px;">
                  <div>
                    <strong style="color: #374151;">Name:</strong>
                    <span style="color: #6b7280; margin-left: 8px;">${name}</span>
                  </div>
                  <div>
                    <strong style="color: #374151;">Email:</strong>
                    <span style="color: #6b7280; margin-left: 8px;">${email}</span>
                  </div>
                  <div>
                    <strong style="color: #374151;">Join Time:</strong>
                    <span style="color: #6b7280; margin-left: 8px;">${joinTime.toLocaleString()}</span>
                  </div>
                  <div>
                    <strong style="color: #374151;">Status:</strong>
                    <span style="color: #10b981; margin-left: 8px; font-weight: 600;">✅ Email Verified & Setup Complete</span>
                  </div>
                </div>
              </div>
              
              <!-- Stats -->
              <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <h3 style="color: #1e293b; margin: 0 0 12px; font-size: 16px; font-weight: 600;">
                  📊 Quick Stats
                </h3>
                <ul style="color: #64748b; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
                  <li>User completed full signup process</li>
                  <li>Email verification successful</li>
                  <li>Ready to start MNZD journey</li>
                  <li>Account created: ${joinTime.toDateString()}</li>
                </ul>
              </div>
              
              <!-- Action Items -->
              <div style="background: #eff6ff; border: 1px solid #3b82f6; border-radius: 8px; padding: 20px;">
                <h3 style="color: #1d4ed8; margin: 0 0 12px; font-size: 16px; font-weight: 600;">
                  🚀 Next Steps
                </h3>
                <ul style="color: #1d4ed8; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
                  <li>User will be guided through welcome onboarding</li>
                  <li>MNZD methodology introduction</li>
                  <li>Dashboard setup and first habits</li>
                  <li>Monitor user engagement in first 7 days</li>
                </ul>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; margin: 0; font-size: 12px;">
                🔗 Never Break The Chain - User Management System<br>
                Generated automatically on user signup completion
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("New user notification email error:", error);
    return false;
  }
}

// Test email connection
export async function testEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    console.error("Email connection test failed:", error);
    return false;
  }
}
