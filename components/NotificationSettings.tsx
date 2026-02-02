'use client'

import { useState, useEffect } from 'react';
import { Bell, BellOff, TestTube, Sparkles, X, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/lib/notifications/use-notifications';
import { toast } from 'sonner';

interface NotificationSettingsProps {
  onDisableNotifications?: () => void;
}

export default function NotificationSettings({ onDisableNotifications }: NotificationSettingsProps) {
  const { isEnabled, permission, enableNotifications, sendTestNotification, disableWebsiteNotifications, isWebsiteNotificationsEnabled } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);
  const [websiteEnabled, setWebsiteEnabled] = useState(true);
  const [currentPermission, setCurrentPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    setWebsiteEnabled(isWebsiteNotificationsEnabled());
    
    // Check current permission state
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setCurrentPermission(Notification.permission);
      
      // Listen for permission changes (some browsers support this)
      const checkPermission = () => {
        setCurrentPermission(Notification.permission);
      };
      
      // Check permission periodically (fallback for browsers that don't support permission change events)
      const interval = setInterval(checkPermission, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isWebsiteNotificationsEnabled]);

  const handleRequestPermission = async () => {
    if (currentPermission === 'denied') {
      toast.error(
        'Notifications are blocked. Please click the 🔒 icon in your browser address bar and allow notifications, then refresh the page.',
        { duration: 6000 }
      );
      return;
    }
    
    if (currentPermission === 'granted') {
      toast.info('Notifications are already enabled!');
      return;
    }
    
    setIsLoading(true);
    try {
      const granted = await enableNotifications();
      if (granted) {
        setCurrentPermission('granted');
        toast.success('🎉 Smart notifications enabled!');
      } else {
        setCurrentPermission(Notification.permission);
        if (Notification.permission === 'denied') {
          toast.error(
            'Notifications were blocked. Please click the 🔒 icon in your browser address bar and allow notifications.',
            { duration: 6000 }
          );
        } else {
          toast.error('Please allow notifications when prompted by your browser.');
        }
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      toast.error('Failed to enable notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleWebsiteNotifications = () => {
    if (websiteEnabled) {
      disableWebsiteNotifications();
      setWebsiteEnabled(false);
      toast.success('Website notifications disabled');
      onDisableNotifications?.();
    } else {
      // Re-enable website notifications
      localStorage.removeItem('websiteNotificationsDisabled');
      setWebsiteEnabled(true);
      toast.success('Website notifications enabled');
    }
  };

  const handleTestNotification = async () => {
    if (currentPermission !== 'granted') {
      toast.error('Please enable browser notifications first');
      return;
    }
    
    if (!websiteEnabled) {
      toast.error('Website notifications are disabled');
      return;
    }
    
    try {
      await sendTestNotification();
      toast.success('Test notification sent!');
    } catch (error) {
      toast.error('Failed to send test notification');
    }
  };

  const getPermissionStatus = () => {
    switch (currentPermission) {
      case 'granted':
        return { color: 'green', text: 'Enabled', icon: Bell };
      case 'denied':
        return { color: 'red', text: 'Blocked', icon: Lock };
      default:
        return { color: 'gray', text: 'Not Set', icon: AlertCircle };
    }
  };

  const getButtonConfig = () => {
    switch (currentPermission) {
      case 'granted':
        return {
          text: 'Notifications Enabled',
          disabled: true,
          className: 'bg-green-500 hover:bg-green-600 cursor-default',
          icon: Bell
        };
      case 'denied':
        return {
          text: 'Enable in Browser Settings',
          disabled: false,
          className: 'bg-red-500 hover:bg-red-600',
          icon: Lock
        };
      default:
        return {
          text: 'Enable Browser Notifications',
          disabled: false,
          className: 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600',
          icon: Bell
        };
    }
  };

  if (!('Notification' in window)) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <BellOff className="w-5 h-5 text-gray-400" />
          <h3 className="font-semibold text-gray-700">Notifications Not Supported</h3>
        </div>
        <p className="text-sm text-gray-600">
          Your browser doesn't support notifications. Try using Chrome, Firefox, or Safari.
        </p>
      </div>
    );
  }

  const permissionStatus = getPermissionStatus();
  const buttonConfig = getButtonConfig();

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
          <Bell className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Smart Notifications</h3>
          <p className="text-sm text-gray-600">Get personalized reminders to stay consistent</p>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-900">Daily Motivation</p>
            <p className="text-xs text-blue-700">Morning & evening</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
          <Bell className="w-4 h-4 text-purple-600" />
          <div>
            <p className="text-sm font-medium text-purple-900">Smart Reminders</p>
            <p className="text-xs text-purple-700">Learns your patterns</p>
          </div>
        </div>
      </div>

      {/* Status & Actions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full bg-${permissionStatus.color}-500`} />
            <span className="text-sm font-medium">
              Browser: {permissionStatus.text}
            </span>
            <permissionStatus.icon className={`w-3 h-3 text-${permissionStatus.color}-500`} />
          </div>
          {currentPermission === 'denied' && (
            <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
              Check browser settings
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${websiteEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm font-medium">
              Website: {websiteEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <Button
            onClick={handleToggleWebsiteNotifications}
            variant="outline"
            size="sm"
            className={websiteEnabled ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
          >
            {websiteEnabled ? (
              <><X className="w-3 h-3 mr-1" /> Disable</>
            ) : (
              <><Bell className="w-3 h-3 mr-1" /> Enable</>
            )}
          </Button>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleRequestPermission}
            disabled={isLoading || buttonConfig.disabled}
            className={`flex-1 ${buttonConfig.className}`}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            ) : (
              <buttonConfig.icon className="w-4 h-4 mr-2" />
            )}
            {buttonConfig.text}
          </Button>
          
          {currentPermission === 'granted' && websiteEnabled && (
            <Button
              onClick={handleTestNotification}
              variant="outline"
              className="px-4"
              title="Send test notification"
            >
              <TestTube className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Help text based on permission state */}
      {currentPermission === 'denied' && (
        <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
          <p className="text-xs text-red-800">
            <strong>Notifications Blocked:</strong> Click the 🔒 lock icon in your browser's address bar, 
            find "Notifications" and change it to "Allow", then refresh this page.
          </p>
        </div>
      )}
      
      {currentPermission === 'default' && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-800">
            <strong>Ready to Enable:</strong> Click the button above and allow notifications when your browser asks. 
            You'll get smart, personalized reminders to help you stay consistent.
          </p>
        </div>
      )}
      
      {currentPermission === 'granted' && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-xs text-green-800">
            <strong>All Set!</strong> You'll receive personalized motivational messages that adapt to your habits 
            and help you maintain your daily consistency.
          </p>
        </div>
      )}
    </div>
  );
}