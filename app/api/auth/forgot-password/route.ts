import { NextRequest, NextResponse } from 'next/server';
import { sendOTPSchema } from '@/lib/validation';
import { UserService } from '@/lib/models/UserService';
import { sendOTPEmail, generateOTP } from '@/lib/email-service';
import { applyRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, checkOnly } = body;

    // Input sanitization
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    const sanitizedEmail = email.toLowerCase().trim();
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await UserService.findByEmail(sanitizedEmail);
    if (!existingUser) {
      return NextResponse.json(
        { error: 'No account found with this email address. Please check your email or create a new account.' },
        { status: 404 }
      );
    }

    // If only checking if user exists
    if (checkOnly) {
      return NextResponse.json({ message: 'User found' });
    }

    // Apply DUAL-LAYER rate limiting (IP + Email based)
    // Layer 1: IP-based protection (prevents multiple email attacks from same IP)
    const rateLimitResult = await applyRateLimit(request, 'forgot-password', 5, 300); // 5 per 5 minutes per IP
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many password reset attempts from this location. Please wait 5 minutes.' },
        { status: 429 }
      );
    }

    // Layer 2: Email-based protection (prevents spam to specific email)
    const { canSend, cooldownSeconds, message } = await UserService.canSendOTP(sanitizedEmail);
    if (!canSend) {
      return NextResponse.json(
        { 
          error: message || `Please wait ${Math.ceil(cooldownSeconds / 60)} minutes before requesting another code.`,
          cooldownSeconds 
        },
        { status: 429 }
      );
    }

    // Generate and send OTP
    const otp = generateOTP();
    const emailSent = await sendOTPEmail(sanitizedEmail, otp, 'reset');
    
    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send email. Please try again or contact support.' },
        { status: 500 }
      );
    }

    // Store OTP in database
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await UserService.updateOTP(sanitizedEmail, otp, expiresAt);

    return NextResponse.json({
      message: 'Password reset code sent to your email',
      cooldownSeconds: 60
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}