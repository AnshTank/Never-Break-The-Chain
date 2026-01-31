'use client'

import { useEffect, useState } from 'react';
import NotificationService, { UserProgress } from './notification-service';

export const useNotifications = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      setIsEnabled(Notification.permission === 'granted');
    }
  }, []);

  const enableNotifications = async (): Promise<boolean> => {
    const granted = await NotificationService.requestPermission();
    setIsEnabled(granted);
    setPermission(Notification.permission);
    return granted;
  };

  const scheduleSmartNotifications = async (userProgress: UserProgress) => {
    if (isEnabled) {
      NotificationService.scheduleNotifications(userProgress);
    }
  };

  const sendTestNotification = async () => {
    if (isEnabled) {
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
    sendTestNotification
  };
};

export default useNotifications;