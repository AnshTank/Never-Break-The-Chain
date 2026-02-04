import { useState, useEffect } from 'react';

export function useNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) return false;
    
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  };

  // Email-only system - these are stub functions
  const scheduleSmartNotifications = (userProgress: any) => {
    // Notifications are handled by cron jobs, not client-side
    console.log('Smart notifications handled by server-side cron jobs');
  };

  const sendWelcomeNotification = () => {
    // Welcome emails are sent by server, not client
    console.log('Welcome notification handled by server-side email system');
  };

  return {
    isSupported,
    permission,
    requestPermission,
    isEnabled: permission === 'granted',
    scheduleSmartNotifications,
    sendWelcomeNotification
  };
}