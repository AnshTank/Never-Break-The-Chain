import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { generateTokens } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

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

    const { db } = await connectToDatabase();
    const users = db.collection('users');

    // Find user and check if email is verified
    const user = await users.findOne({ email: sanitizedEmail });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        { error: 'Email not verified' },
        { status: 400 }
      );
    }

    // Generate tokens for login
    const { accessToken, refreshToken, accessTokenMaxAge, refreshTokenMaxAge } = generateTokens({
      userId: user._id.toString(),
      email: user.email
    });

    // Create response with tokens
    const response = NextResponse.json({ 
      message: 'Email verified successfully! Redirecting to onboarding...',
      redirect: '/welcome'
    });

    // Set secure HTTP-only cookies
    response.cookies.set('auth-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: accessTokenMaxAge,
      path: '/'
    });

    response.cookies.set('refresh-token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: refreshTokenMaxAge,
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Complete signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}