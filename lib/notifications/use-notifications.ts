'use client'

import { useEffect, useState, useCallback } from 'react';
import NotificationService, { UserProgress } from './notification-service';
import { getDeviceId } from '@/lib/device-id';

export const useNotifications = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isClient, setIsClient] = useState(false);

  // Function to check and update permission state
  const updatePermissionState = useCallback(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const currentPermission = Notification.permission;
      setPermission(currentPermission);
      setIsEnabled(currentPermission === 'granted');
      return currentPermission;
    }
    return 'default';
  }, []);

  useEffect(() => {
    setIsClient(true);
    
    if (typeof window !== 'undefined' && 'Notification' in window) {
      // Initial permission check
      updatePermissionState();
      
      // Initialize service worker for push notifications if permission is granted
      if (Notification.permission === 'granted') {
        NotificationService.initializeServiceWorker();
        
        // Track user activity for smart notifications (throttled)
        let lastActivityUpdate = 0;
        const trackActivity = () => {
          const now = Date.now();
          // Only update activity every 5 minutes to reduce overhead
          if (now - lastActivityUpdate > 5 * 60 * 1000) {
            lastActivityUpdate = now;
            NotificationService.updateActivity();
          }
        };
        
        // Track fewer, more meaningful interactions
        const events = ['click', 'keypress', 'scroll'];
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
  }, [updatePermissionState]);

  const enableNotifications = async (): Promise<boolean> => {
    if (!isClient || typeof window === 'undefined' || !('Notification' in window)) {
      console.log('Notifications not supported');
      return false;
    }
    
    // Check current permission first
    const currentPermission = updatePermissionState();
    
    // If already granted, return true
    if (currentPermission === 'granted') {
      console.log('Notifications already granted');
      // Register push subscription with device
      await registerPushSubscription();
      return true;
    }
    
    // If denied, return false immediately
    if (currentPermission === 'denied') {
      console.log('Notifications denied');
      return false;
    }
    
    try {
      console.log('Requesting notification permission...');
      
      // Request permission using the most compatible method
      let newPermission: NotificationPermission;
      
      if ('requestPermission' in Notification) {
        // Modern promise-based API
        if (typeof Notification.requestPermission === 'function') {
          const result = Notification.requestPermission();
          
          // Handle both callback and promise versions
          if (result && typeof result.then === 'function') {
            // Promise-based
            newPermission = await result;
          } else {
            // Callback-based (fallback)
            newPermission = await new Promise<NotificationPermission>((resolve) => {
              Notification.requestPermission((permission) => {
                resolve(permission);
              });
            });
          }
        } else {
          // Very old browsers
          newPermission = await new Promise<NotificationPermission>((resolve) => {
            (Notification as any).requestPermission((permission: NotificationPermission) => {
              resolve(permission);
            });
          });
        }
      } else {
        console.error('Notification.requestPermission not available');
        return false;
      }
      
      console.log('Permission result:', newPermission);
      
      // Update state with new permission
      setPermission(newPermission);
      const granted = newPermission === 'granted';
      setIsEnabled(granted);
      
      if (granted) {
        // Initialize service worker after permission is granted
        try {
          await NotificationService.initializeServiceWorker();
          console.log('Service worker initialized');
          
          // Register push subscription with device
          await registerPushSubscription();
        } catch (swError) {
          console.error('Failed to initialize service worker:', swError);
        }
      }
      
      return granted;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      // Update permission state in case of error
      updatePermissionState();
      return false;
    }
  };

  const registerPushSubscription = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BLQK6JX65-Jkc1ubvAvRBs7FFGfuV1aVk3NlihqFM7mtdlrrnDhgK9IhNKFDCCk9okl-y8DXkoxddsS8sBjdFy0'
        });
        
        // Register subscription with device
        const deviceId = getDeviceId();
        await fetch('/api/devices/push-subscription', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-device-id': deviceId
          },
          body: JSON.stringify({
            pushSubscription: subscription
          })
        });
        
        console.log('Push subscription registered');
      }
    } catch (error) {
      console.error('Failed to register push subscription:', error);
    }
  };

  const scheduleSmartNotifications = async (userProgress: UserProgress) => {
    if (isEnabled && isClient && isWebsiteNotificationsEnabled()) {
      try {
        NotificationService.scheduleNotifications(userProgress);
      } catch (error) {
        console.error('Failed to schedule notifications:', error);
      }
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
      console.log('Welcome notification skipped:', { 
        isEnabled, 
        isClient, 
        websiteEnabled: isWebsiteNotificationsEnabled(),
        permission: Notification?.permission 
      });
    }
  };

  const sendTestNotification = async () => {
    if (!isClient || typeof window === 'undefined') {
      throw new Error('Not in browser environment');
    }
    
    if (!isWebsiteNotificationsEnabled()) {
      throw new Error('Website notifications are disabled');
    }
    
    try {
      // Use the enhanced email notification endpoint
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'morning' })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send test notification');
      }
      
      const result = await response.json();
      console.log('Test notification result:', result);
      
      // Also send browser notification if enabled
      if (isEnabled && Notification.permission === 'granted') {
        await NotificationService.sendNotification(
          '🔗 Test Notification',
          'Your smart notifications are working perfectly! 🎉'
        );
      }
    } catch (error) {
      console.error('Failed to send test notification:', error);
      throw error;
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

  // Expose method to manually refresh permission state
  const refreshPermissionState = useCallback(() => {
    return updatePermissionState();
  }, [updatePermissionState]);

  return {
    isEnabled,
    permission,
    enableNotifications,
    scheduleSmartNotifications,
    sendWelcomeNotification,
    sendTestNotification,
    isWebsiteNotificationsEnabled,
    disableWebsiteNotifications,
    refreshPermissionState,
    isClient
  };
};

export default useNotifications;