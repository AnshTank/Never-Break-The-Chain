import { DeviceManager } from './device-manager';

export class LogoutManager {
  static async performLogout(redirectTo: string = '/login'): Promise<void> {
    try {
      // Clear remember me from localStorage
      DeviceManager.clearRememberMe();
      
      // Stop activity tracking
      DeviceManager.stopActivityTracking();
      
      // Call server logout
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      // Clear all localStorage
      localStorage.clear();
      
      // Redirect to login
      window.location.href = redirectTo;
    } catch (error) {
      console.error('Logout failed:', error);
      // Force clear and redirect even if logout API fails
      localStorage.clear();
      window.location.href = redirectTo;
    }
  }

  static async performDeviceLogout(deviceId: string): Promise<void> {
    try {
      const response = await fetch('/api/devices/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.redirect) {
          // Clear all data and redirect
          DeviceManager.clearRememberMe();
          DeviceManager.stopActivityTracking();
          localStorage.clear();
          window.location.href = data.redirect;
        }
      }
    } catch (error) {
      console.error('Device logout failed:', error);
      // Fallback logout
      localStorage.clear();
      window.location.href = '/login';
    }
  }
}