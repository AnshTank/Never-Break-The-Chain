'use client'

import { useState, useEffect } from 'react';
import { Bell, BellOff, TestTube, Sparkles, X } from 'lucide-react';
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

  useEffect(() => {
    setWebsiteEnabled(isWebsiteNotificationsEnabled());
  }, [isWebsiteNotificationsEnabled]);

  const handleToggleNotifications = async () => {
    if (isEnabled) {
      // Can't programmatically disable browser notifications, show instructions
      toast.info('To disable browser notifications, click the 🔒 icon in your browser address bar and change notification settings.');
      return;
    }
    
    setIsLoading(true);
    try {
      const granted = await enableNotifications();
      if (granted) {
        toast.success('🎉 Smart notifications enabled!');
      } else {
        toast.error('Please allow notifications in your browser settings.');
      }
    } catch (error) {
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
            <div className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-sm font-medium">
              Browser: {isEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
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
            onClick={handleToggleNotifications}
            disabled={isLoading}
            className={`flex-1 ${isEnabled 
              ? 'bg-gray-500 hover:bg-gray-600' 
              : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
            }`}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            ) : isEnabled ? (
              <BellOff className="w-4 h-4 mr-2" />
            ) : (
              <Bell className="w-4 h-4 mr-2" />
            )}
            {isEnabled ? 'Manage Browser Settings' : 'Enable Browser Notifications'}
          </Button>
          
          {isEnabled && websiteEnabled && (
            <Button
              onClick={handleTestNotification}
              variant="outline"
              className="px-4"
            >
              <TestTube className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-800">
          <strong>Smart & Helpful:</strong> Get personalized motivational messages that adapt to your habits and help you stay consistent with your goals.
        </p>
      </div>
    </div>
  );
}