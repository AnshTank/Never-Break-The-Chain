import { NextRequest, NextResponse } from 'next/server';
import { DeviceSessionManager } from '@/lib/device-session-manager';

function getDeviceType(userAgent: string): string {
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) return 'mobile';
  return 'desktop';
}

function getBrowserName(userAgent: string): string {
  if (userAgent.includes('Edg')) return 'Edge';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  return 'Unknown';
}

function getOSName(userAgent: string): string {
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS')) return 'iOS';
  return 'Unknown';
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    let deviceId = request.headers.get('x-device-id') || request.cookies.get('device-id')?.value || request.cookies.get('device_id')?.value;
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }

    // If no device ID found, generate one (fallback)
    if (!deviceId) {
      const hardware = getHardwareFingerprint(request.headers.get('user-agent') || '');
      deviceId = `device_${hardware}_${Date.now().toString(36)}`;
    }

    const userAgent = request.headers.get('user-agent') || '';
    const browser = getBrowserName(userAgent);
    const os = getOSName(userAgent);
    
    const deviceInfo = {
      deviceId,
      deviceName: `${browser} on ${os}`,
      deviceType: getDeviceType(userAgent) as 'mobile' | 'tablet' | 'desktop',
      browser,
      os,
      rememberMe: false
    };
    
    await DeviceSessionManager.registerDevice(userId, deviceInfo, true);
    
    // Set device ID cookie if not present
    const response = NextResponse.json({ success: true, deviceId });
    if (!request.cookies.get('device-id')?.value && !request.cookies.get('device_id')?.value) {
      const expires = new Date();
      expires.setFullYear(expires.getFullYear() + 1);
      response.cookies.set('device-id', deviceId, {
        expires,
        path: '/',
        sameSite: 'strict',
        httpOnly: false // Allow client-side access
      });
    }
    
    return response;
  } catch (error) {
    console.error('Device registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}

function getHardwareFingerprint(userAgent: string): string {
  try {
    const fingerprint = [
      userAgent.length,
      userAgent.includes('Mobile') ? 'mobile' : 'desktop',
      Date.now().toString().slice(-6)
    ].join('|');
    
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      hash = ((hash << 5) - hash) + fingerprint.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36).substr(0, 8);
  } catch {
    return 'unknown';
  }
}