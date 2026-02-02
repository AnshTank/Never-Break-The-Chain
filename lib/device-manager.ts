import { ObjectId } from 'mongodb';

export interface DeviceInfo {
  _id?: ObjectId;
  userId: ObjectId;
  deviceId: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  lastActive: Date;
  lastLogin: Date;
  pushSubscription?: PushSubscription;
  isActive: boolean;
  registeredAt: Date;
  rememberMe: boolean;
  rememberMeExpiry?: Date;
  // New fields for better device identification
  physicalDeviceId: string; // Hardware-based identifier
  browserSessions: Array<{
    browser: string;
    sessionId: string;
    lastActive: Date;
  }>;
}

export class DeviceManager {
  private static readonly DEVICE_ID_KEY = 'device_id';
  private static lastActivity = Date.now();
  private static activityTimer: NodeJS.Timeout | null = null;
  private static readonly INACTIVITY_TIMEOUT = 12 * 60 * 60 * 1000;

  // Get or create device ID that works across browsers
  static getDeviceId(): string {
    // Try to get from localStorage first
    let deviceId = localStorage.getItem(this.DEVICE_ID_KEY);
    if (deviceId) return deviceId;

    // Try to get from cookie (shared across browsers)
    deviceId = this.getCookieValue(this.DEVICE_ID_KEY);
    if (deviceId) {
      localStorage.setItem(this.DEVICE_ID_KEY, deviceId);
      return deviceId;
    }

    // Generate new device ID based on hardware
    const hardware = this.getHardwareFingerprint();
    deviceId = `device_${hardware}_${Date.now().toString(36)}`;
    
    // Store in both localStorage and cookie
    localStorage.setItem(this.DEVICE_ID_KEY, deviceId);
    this.setCookie(this.DEVICE_ID_KEY, deviceId);
    
    return deviceId;
  }

  // Cookie utilities
  static getCookieValue(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  static setCookie(name: string, value: string): void {
    if (typeof document === 'undefined') return;
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
  }

  // Hardware fingerprint
  static getHardwareFingerprint(): string {
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
  }

  static initActivityTracking(): void {
    // Track user activity with throttling
    let lastActivityUpdate = 0;
    const updateActivity = () => {
      const now = Date.now();
      this.lastActivity = now;
      
      // Only update server every 5 minutes to reduce API calls
      if (now - lastActivityUpdate > 5 * 60 * 1000) {
        lastActivityUpdate = now;
        this.updateLastActive();
      }
    };

    // Listen for user interactions (throttled)
    const events = ['mousedown', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Check for inactivity every 5 minutes instead of every minute
    this.activityTimer = setInterval(() => {
      const timeSinceLastActivity = Date.now() - this.lastActivity;
      if (timeSinceLastActivity > this.INACTIVITY_TIMEOUT) {
        this.handleInactivityTimeout();
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
  }

  static handleInactivityTimeout(): void {
    // Clear remember me and redirect to login
    this.clearRememberMe();
    
    // Clear activity timer
    if (this.activityTimer) {
      clearInterval(this.activityTimer);
      this.activityTimer = null;
    }

    // Logout and redirect
    fetch('/api/auth/logout', { method: 'POST' })
      .then(() => {
        window.location.href = '/login?message=Session expired due to inactivity';
      })
      .catch(() => {
        window.location.href = '/login?message=Session expired due to inactivity';
      });
  }

  static stopActivityTracking(): void {
    if (this.activityTimer) {
      clearInterval(this.activityTimer);
      this.activityTimer = null;
    }
  }

  // Generate a stable device identifier that persists across browsers and networks
  private static generatePhysicalDeviceId(): string {
    // Check if we already have a stored physical device ID
    const stored = localStorage.getItem('physicalDeviceId');
    if (stored) return stored;
    
    // Use only the most stable hardware characteristics
    const fingerprint = [
      navigator.hardwareConcurrency || 0,
      screen.width,
      screen.height,
      screen.colorDepth,
      navigator.platform
    ].join('|');
    
    // Create a hash of the fingerprint
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    const deviceId = Math.abs(hash).toString(36);
    
    // Store it immediately for consistency across browsers
    localStorage.setItem('physicalDeviceId', deviceId);
    return deviceId;
  }

  private static generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `${timestamp}-${random}`;
  }

  // Helper function to detect iPhone models from screen dimensions
  private static getIPhoneModel(width: number, height: number): string | null {
    const maxDimension = Math.max(width, height);
    const minDimension = Math.min(width, height);
    
    // iPhone model detection based on screen size
    if (maxDimension === 926 && minDimension === 428) return 'iPhone 14 Pro Max';
    if (maxDimension === 844 && minDimension === 390) return 'iPhone 14 Pro';
    if (maxDimension === 812 && minDimension === 375) return 'iPhone 13/14';
    if (maxDimension === 736 && minDimension === 414) return 'iPhone 8 Plus';
    if (maxDimension === 667 && minDimension === 375) return 'iPhone SE/8';
    return null;
  }

  // Helper function to detect iPad models
  private static getIPadModel(width: number, height: number): string | null {
    const maxDimension = Math.max(width, height);
    const minDimension = Math.min(width, height);
    
    if (maxDimension === 1366 && minDimension === 1024) return 'iPad Pro 12.9"';
    if (maxDimension === 1194 && minDimension === 834) return 'iPad Pro 11"';
    if (maxDimension === 1080 && minDimension === 810) return 'iPad Air';
    if (maxDimension === 1024 && minDimension === 768) return 'iPad';
    return null;
  }

  // Helper function to detect Mac models
  private static getMacModel(): string | null {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Intel')) return 'Intel Mac';
    if (userAgent.includes('Apple')) return 'Apple Silicon Mac';
    return null;
  }

  static getDeviceInfo(): Partial<DeviceInfo> & { sessionId: string } {
    const userAgent = navigator.userAgent;
    
    // Detect device type with better logic
    let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
    if (/iPad|tablet/i.test(userAgent)) {
      deviceType = 'tablet';
    } else if (/Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      deviceType = 'mobile';
    }

    // Detect browser with version
    let browser = 'Unknown';
    if (userAgent.includes('Edg/')) {
      const version = userAgent.match(/Edg\/(\d+)/)?.[1];
      browser = `Edge ${version || ''}`;
    } else if (userAgent.includes('Chrome/')) {
      const version = userAgent.match(/Chrome\/(\d+)/)?.[1];
      browser = `Chrome ${version || ''}`;
    } else if (userAgent.includes('Firefox/')) {
      const version = userAgent.match(/Firefox\/(\d+)/)?.[1];
      browser = `Firefox ${version || ''}`;
    } else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome')) {
      const version = userAgent.match(/Version\/(\d+)/)?.[1];
      browser = `Safari ${version || ''}`;
    }

    // Detect OS with better detection
    let os = 'Unknown';
    if (userAgent.includes('Windows NT 10.0')) os = 'Windows 11';
    else if (userAgent.includes('Windows NT 6.3')) os = 'Windows 8.1';
    else if (userAgent.includes('Windows NT 6.1')) os = 'Windows 7';
    else if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac OS X')) {
      const version = userAgent.match(/Mac OS X ([\d_]+)/)?.[1]?.replace(/_/g, '.');
      os = version ? `macOS ${version}` : 'macOS';
    } else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) {
      const version = userAgent.match(/Android ([\d.]+)/)?.[1];
      os = version ? `Android ${version}` : 'Android';
    } else if (userAgent.includes('iPhone OS')) {
      const version = userAgent.match(/iPhone OS ([\d_]+)/)?.[1]?.replace(/_/g, '.');
      os = version ? `iOS ${version}` : 'iOS';
    } else if (userAgent.includes('iPad')) {
      const version = userAgent.match(/OS ([\d_]+)/)?.[1]?.replace(/_/g, '.');
      os = version ? `iPadOS ${version}` : 'iPadOS';
    }

    // Enhanced device detection with available info
    let deviceName = '';
    const cores = navigator.hardwareConcurrency || 'Unknown';
    
    if (deviceType === 'mobile') {
      if (os.includes('iPhone') || os.includes('iOS')) {
        // Try to detect iPhone model from screen size
        const iphoneModel = this.getIPhoneModel(screen.width, screen.height);
        deviceName = iphoneModel || 'iPhone';
      } else if (os.includes('Android')) {
        deviceName = 'Android Phone';
      } else {
        deviceName = 'Mobile Device';
      }
    } else if (deviceType === 'tablet') {
      if (os.includes('iPad')) {
        const ipadModel = this.getIPadModel(screen.width, screen.height);
        deviceName = ipadModel || 'iPad';
      } else if (os.includes('Android')) {
        deviceName = 'Android Tablet';
      } else {
        deviceName = 'Tablet';
      }
    } else {
      // Desktop - can show more info
      if (os.includes('Windows')) {
        deviceName = 'Windows PC';
        if (cores !== 'Unknown') deviceName += ` • ${cores} cores`;
      } else if (os.includes('macOS')) {
        const macModel = this.getMacModel();
        deviceName = macModel || 'Mac';
      } else if (os.includes('Linux')) {
        deviceName = 'Linux PC';
        if (cores !== 'Unknown') deviceName += ` • ${cores} cores`;
      } else {
        deviceName = 'Desktop Computer';
      }
    }

    const sessionId = this.generateSessionId();

    return {
      deviceType,
      browser,
      os,
      deviceName,
      sessionId,
    };
  }

  static getStoredDeviceId(): string | null {
    return localStorage.getItem('deviceId');
  }

  static setStoredDeviceId(deviceId: string): void {
    localStorage.setItem('deviceId', deviceId);
  }

  static getStoredPhysicalDeviceId(): string | null {
    return localStorage.getItem('physicalDeviceId');
  }

  static setStoredPhysicalDeviceId(physicalDeviceId: string): void {
    localStorage.setItem('physicalDeviceId', physicalDeviceId);
  }

  // Get or create a consistent physical device ID
  static getOrCreatePhysicalDeviceId(): string {
    let physicalId = this.getStoredPhysicalDeviceId();
    if (!physicalId) {
      physicalId = this.generatePhysicalDeviceId();
    }
    return physicalId;
  }

  static async performAutoLogin(): Promise<{ success: boolean; redirect?: string }> {
    const { shouldAutoLogin, deviceId } = await this.checkAutoLogin();
    
    if (!shouldAutoLogin || !deviceId) {
      return { success: false };
    }

    try {
      const response = await fetch('/api/auth/auto-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId }),
      });

      if (response.ok) {
        const data = await response.json();
        return { 
          success: true, 
          redirect: data.redirect || '/dashboard' 
        };
      }
    } catch (error) {
      console.error('Auto-login failed:', error);
    }

    return { success: false };
  }

  static generateAndStoreDeviceId(): string {
    const deviceId = this.generateSessionId();
    this.setStoredDeviceId(deviceId);
    return deviceId;
  }

  static async registerDevice(pushSubscription?: PushSubscription, rememberMe: boolean = false): Promise<{ success: boolean; deviceId: string; message?: string }> {
    try {
      const deviceId = this.getDeviceId();
      const deviceInfo = this.getDeviceInfo();
      
      const response = await fetch('/api/devices/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId,
          ...deviceInfo,
          pushSubscription,
          rememberMe,
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        return { success: false, deviceId, message: result.message };
      }

      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('rememberMeExpiry', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());
      } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('rememberMeExpiry');
      }

      return { success: true, deviceId, message: result.message };
    } catch (error) {
      console.error('Device registration failed:', error);
      return { success: false, deviceId: '', message: 'Registration failed' };
    }
  }

  static async updateLastActive(): Promise<void> {
    const deviceId = this.getStoredDeviceId();
    if (!deviceId) return;

    try {
      await fetch('/api/devices/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId }),
      });
    } catch (error) {
      console.error('Failed to update device activity:', error);
    }
  }

  static isRememberMeActive(): boolean {
    const rememberMe = localStorage.getItem('rememberMe');
    const expiry = localStorage.getItem('rememberMeExpiry');
    
    if (!rememberMe || !expiry) return false;
    
    return new Date() < new Date(expiry);
  }

  static clearRememberMe(): void {
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('rememberMeExpiry');
  }

  static async checkAutoLogin(): Promise<{ shouldAutoLogin: boolean; deviceId?: string }> {
    // Check if remember me is active
    if (!this.isRememberMeActive()) {
      return { shouldAutoLogin: false };
    }

    const deviceId = this.getStoredDeviceId();
    if (!deviceId) {
      return { shouldAutoLogin: false };
    }

    try {
      // Check if device is still registered and active
      const response = await fetch('/api/devices/check-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId }),
      });

      if (response.ok) {
        const data = await response.json();
        return { 
          shouldAutoLogin: data.isActive && data.isRegistered,
          deviceId 
        };
      }
    } catch (error) {
      console.error('Failed to check auto-login status:', error);
    }

    return { shouldAutoLogin: false };
  }
}