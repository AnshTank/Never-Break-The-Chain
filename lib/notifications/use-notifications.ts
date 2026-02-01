'use client'

import { useEffect, useState } from 'react';
import NotificationService, { UserProgress } from './notification-service';

export const useNotifications = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined' && 'Notification' in window) {
      // Check actual permission status
      const currentPermission = Notification.permission;
      setPermission(currentPermission);
      setIsEnabled(currentPermission === 'granted');
      
      // Initialize service worker for push notifications
      if (currentPermission === 'granted') {
        NotificationService.initializeServiceWorker();
        
        // Track user activity for smart notifications
        const trackActivity = () => NotificationService.updateActivity();
        
        // Track various user interactions
        const events = ['click', 'scroll', 'keypress', 'mousemove', 'touchstart'];
        events.forEach(event => {
          document.addEventListener(event, trackActivity, { passive: true });
        });
        
        // Cleanup on unmount
        return () => {
          events.forEach(event => {
            document.removeEventListener(event, trackActivity);
          });
        };
      }
    }
  }, []);

  const enableNotifications = async (): Promise<boolean> => {
    if (!isClient || typeof window === 'undefined' || !('Notification' in window)) return false;
    
    // If already granted, return true
    if (Notification.permission === 'granted') {
      setIsEnabled(true);
      setPermission('granted');
      return true;
    }
    
    // If denied, return false
    if (Notification.permission === 'denied') {
      return false;
    }
    
    try {
      // Force permission request for 'default' status
      const permission = await new Promise<NotificationPermission>((resolve) => {
        // Use the callback version to ensure compatibility
        const result = Notification.requestPermission((permission) => {
          resolve(permission);
        });
        
        // Handle promise-based version for modern browsers
        if (result && typeof result.then === 'function') {
          result.then(resolve);
        }
      });
      
      const granted = permission === 'granted';
      
      setIsEnabled(granted);
      setPermission(permission);
      
      if (granted) {
        // Initialize service worker after permission is granted
        await NotificationService.initializeServiceWorker();
      }
      
      return granted;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const scheduleSmartNotifications = async (userProgress: UserProgress) => {
    if (isEnabled && isClient && isWebsiteNotificationsEnabled()) {
      NotificationService.scheduleNotifications(userProgress);
    }
  };

  const sendWelcomeNotification = async () => {
    if (isEnabled && isClient && isWebsiteNotificationsEnabled()) {
      try {
        console.log('Sending welcome notification...');
        await NotificationService.sendWelcomeNotification();
        console.log('Welcome notification sent successfully');
      } catch (error) {
        console.error('Failed to send welcome notification:', error);
      }
    } else {
      console.log('Welcome notification skipped:', { isEnabled, isClient, websiteEnabled: isWebsiteNotificationsEnabled() });
    }
  };

  const sendTestNotification = async () => {
    if (isEnabled && isClient && isWebsiteNotificationsEnabled()) {
      await NotificationService.sendNotification(
        '🔗 Test Notification',
        'Your smart notifications are working perfectly! 🎉'
      );
    }
  };

  const isWebsiteNotificationsEnabled = (): boolean => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('websiteNotificationsDisabled') !== 'true';
  };

  const disableWebsiteNotifications = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('websiteNotificationsDisabled', 'true');
    }
  };

  return {
    isEnabled,
    permission,
    enableNotifications,
    scheduleSmartNotifications,
    sendWelcomeNotification,
    sendTestNotification,
    isWebsiteNotificationsEnabled,
    disableWebsiteNotifications,
    isClient
  };
};

export default useNotifications;