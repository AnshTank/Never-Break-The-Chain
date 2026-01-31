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
      setPermission(Notification.permission);
      setIsEnabled(Notification.permission === 'granted');
      
      // Track user activity for smart notifications
      if (Notification.permission === 'granted') {
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
    if (!isClient || typeof window === 'undefined') return false;
    
    const granted = await NotificationService.requestPermission();
    setIsEnabled(granted);
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
    return granted;
  };

  const scheduleSmartNotifications = async (userProgress: UserProgress) => {
    if (isEnabled && isClient) {
      NotificationService.scheduleNotifications(userProgress);
    }
  };

  const sendTestNotification = async () => {
    if (isEnabled && isClient) {
      await NotificationService.sendNotification(
        '🔗 Test Notification',
        'Your smart notifications are working perfectly! 🎉'
      );
    }
  };

  return {
    isEnabled,
    permission,
    enableNotifications,
    scheduleSmartNotifications,
    sendTestNotification,
    isClient
  };
};

export default useNotifications;