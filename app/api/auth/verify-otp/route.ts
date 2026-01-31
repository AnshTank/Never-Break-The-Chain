import { NextRequest, NextResponse } from 'next/server';
import { verifyOTPSchema } from '@/lib/validation';
import { UserService } from '@/lib/models/UserService';
import { applyRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await applyRateLimit(request, 'otp-verify', 10, 900); // 10 per 15 minutes
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = verifyOTPSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, otp } = validation.data;

    // Verify OTP
    const result = await UserService.verifyOTP(email, otp);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    // Mark email as verified
    await UserService.updateUser(email, { emailVerified: true });

    return NextResponse.json({
      message: result.message,
      verified: true
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}