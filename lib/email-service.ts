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

// Email input sanitization
function sanitizeEmailInput(email: string): string {
  return email
    .toLowerCase()
    .trim()
    .replace(/[<>"'&]/g, "");
}
