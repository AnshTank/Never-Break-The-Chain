// Simple device ID utility with error handling
export function getDeviceId(): string {
  const DEVICE_ID_KEY = 'device_id';
  
  try {
    // Try localStorage first
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (deviceId) return deviceId;

    // Try cookie
    const cookieValue = getCookieValue(DEVICE_ID_KEY);
    if (cookieValue) {
      localStorage.setItem(DEVICE_ID_KEY, cookieValue);
      return cookieValue;
    }

    // Generate new ID
    const hardware = getHardwareFingerprint();
    deviceId = `device_${hardware}_${Date.now().toString(36)}`;
    
    // Store in both places
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
    setCookie(DEVICE_ID_KEY, deviceId);
    
    return deviceId;
  } catch (error) {
    // Fallback if localStorage fails
    console.warn('localStorage unavailable, using session-only device ID');
    return `temp_${getHardwareFingerprint()}_${Date.now().toString(36)}`;
  }
}

function getCookieValue(name: string): string | null {
  try {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  } catch {
    return null;
  }
}

function setCookie(name: string, value: string): void {
  try {
    if (typeof document === 'undefined') return;
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
  } catch {
    // Ignore cookie errors
  }
}

function getHardwareFingerprint(): string {
  try {
    const fingerprint = [
      navigator.hardwareConcurrency || 0,
      screen.width,
      screen.height,
      navigator.platform
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