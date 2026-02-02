import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { DeviceSessionManager } from '@/lib/device-session-manager';
import { NotificationScheduler } from '@/lib/notification-scheduler';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value || request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const { 
      deviceId, 
      deviceName, 
      deviceType, 
      browser, 
      os, 
      pushSubscription, 
      rememberMe = false,
      forceRegister = false
    } = await request.json();

    if (!deviceId) {
      return NextResponse.json({ message: 'Device ID required' }, { status: 400 });
    }

    // Use the new device session manager
    const result = await DeviceSessionManager.registerDevice(
      decoded.userId,
      {
        deviceId,
        deviceName: deviceName || 'Unknown Device',
        deviceType: deviceType || 'desktop',
        browser: browser || 'Unknown',
        os: os || 'Unknown',
        rememberMe,
        pushSubscription
      },
      forceRegister
    );

    if (!result.success) {
      return NextResponse.json({
        message: 'Device limit reached',
        requiresDeviceSelection: true,
        success: false,
        existingDevices: result.existingDevices,
      }, { status: 409 });
    }

    // Setup notifications for new user sessions
    try {
      await NotificationScheduler.setupUserNotifications(decoded.userId);
    } catch (error) {
      console.warn('Failed to setup notifications:', error);
    }

    return NextResponse.json({ 
      message: 'Device registered successfully',
      deviceId,
      success: true
    });

  } catch (error) {
    console.error('Device registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value || request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const { deviceIdToRemove } = await request.json();
    const currentDeviceId = request.headers.get('x-device-id');
    const isCurrentDevice = deviceIdToRemove === currentDeviceId;

    // Use the device session manager to remove the device
    await DeviceSessionManager.removeDevice(decoded.userId, deviceIdToRemove);
    
    console.log(`Device ${deviceIdToRemove} completely removed and sessions invalidated`);

    const response = NextResponse.json({ 
      message: 'Device removed successfully',
      shouldLogout: isCurrentDevice,
      redirect: isCurrentDevice ? '/login?message=Device removed successfully' : undefined
    });

    // If removing current device, clear cookies
    if (isCurrentDevice) {
      response.cookies.set('auth-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/'
      });

      response.cookies.set('refresh-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/'
      });
    }

    return response;

  } catch (error) {
    console.error('Device removal error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}