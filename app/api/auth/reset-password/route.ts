import { NextRequest, NextResponse } from 'next/server';
import { resetPasswordSchema } from '@/lib/validation';
import { UserService } from '@/lib/models/UserService';
import { applyRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await applyRateLimit(request, 'reset-password', 5, 900); // 5 per 15 minutes
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = resetPasswordSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, newPassword } = validation.data;

    // Update password directly (OTP already verified in previous step)
    await UserService.updatePassword(email, newPassword);

    return NextResponse.json({
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}