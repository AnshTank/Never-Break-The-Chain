import { NextRequest, NextResponse } from 'next/server';
import { sendOTPSchema } from '@/lib/validation';
import { UserService } from '@/lib/models/UserService';
import { sendOTPEmail, generateOTP } from '@/lib/email-service';
import { applyRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting - more lenient for development
    const rateLimitResult = await applyRateLimit(request, 'otp-send', 10, 1800); // 10 per 30 minutes
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = sendOTPSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, type } = validation.data;

    // Check if user exists for reset, or doesn't exist for verification
    const existingUser = await UserService.findByEmail(email);
    
    if (type === 'reset' && !existingUser) {
      return NextResponse.json(
        { error: 'No account found with this email address' },
        { status: 404 }
      );
    }
    
    if (type === 'verification' && existingUser && existingUser.emailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      );
    }

    // Check cooldown
    if (existingUser) {
      const { canSend, cooldownSeconds } = await UserService.canSendOTP(email);
      if (!canSend) {
        return NextResponse.json(
          { 
            error: cooldownSeconds > 3600 
              ? 'Too many OTP requests. Please try again in an hour.'
              : `Please wait ${cooldownSeconds} seconds before requesting another code.`,
            cooldownSeconds 
          },
          { status: 429 }
        );
      }
    }

    // Generate and send OTP
    const otp = generateOTP();
    const emailSent = await sendOTPEmail(email, otp, type);
    
    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send email. Please try again or contact support.' },
        { status: 500 }
      );
    }

    // Store OTP in database
    if (existingUser) {
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      await UserService.updateOTP(email, otp, expiresAt);
    } else {
      // For new users, create temporary user record
      await UserService.createUser(email, 'temp-password');
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      await UserService.updateOTP(email, otp, expiresAt);
    }

    return NextResponse.json({
      message: 'OTP sent successfully',
      cooldownSeconds: 60
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}