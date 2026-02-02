import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { generateTokens } from '@/lib/jwt';
import { ObjectId } from 'mongodb';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { deviceId } = await request.json();

    if (!deviceId) {
      return NextResponse.json({ error: 'Device ID required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const devices = db.collection('devices');
    const users = db.collection('users');

    // Find the device
    const device = await devices.findOne({ 
      deviceId,
      isActive: true,
      rememberMe: true,
      rememberMeExpiry: { $gt: new Date() }
    });

    if (!device) {
      return NextResponse.json({ error: 'Device not found or expired' }, { status: 404 });
    }

    // Check if device was active within last 12 hours
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    if (device.lastActive < twelveHoursAgo) {
      // Device inactive for too long, deactivate remember me
      await devices.updateOne(
        { _id: device._id },
        { 
          $set: { 
            rememberMe: false,
            rememberMeExpiry: null
          }
        }
      );
      return NextResponse.json({ error: 'Session expired due to inactivity' }, { status: 401 });
    }

    // Get user details
    const user = await users.findOne({ _id: device.userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user needs welcome flow
    if (user.isNewUser || user.needsPasswordSetup || !user.password) {
      return NextResponse.json({ 
        success: true,
        redirect: '/welcome'
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken, accessTokenMaxAge, refreshTokenMaxAge } = generateTokens({
      userId: user._id.toString(),
      email: user.email
    }, true); // Remember me is true

    // Update device last active and login time
    await devices.updateOne(
      { _id: device._id },
      { 
        $set: { 
          lastActive: new Date(),
          lastLogin: new Date()
        }
      }
    );

    // Create response with tokens
    const response = NextResponse.json({ 
      success: true,
      message: 'Auto-login successful',
      redirect: '/dashboard'
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
    console.error('Auto-login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}