'use client'

import { useState } from 'react';
import { Bell, BellOff, TestTube, Sparkles, Clock, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/lib/notifications/use-notifications';
import { toast } from 'sonner';

export default function NotificationSettings() {
  const { isEnabled, permission, enableNotifications, sendTestNotification } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    try {
      const granted = await enableNotifications();
      if (granted) {
        toast.success('🎉 Smart notifications enabled! You\'ll get motivational reminders.');
      } else {
        toast.error('Notifications blocked. Please enable them in your browser settings.');
      }
    } catch (error) {
      toast.error('Failed to enable notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      await sendTestNotification();
      toast.success('Test notification sent! Check your browser.');
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
          <p className="text-sm text-gray-600">Intelligent reminders that learn your patterns</p>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
          <Clock className="w-4 h-4 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-900">Morning Motivation</p>
            <p className="text-xs text-blue-700">7 AM daily boost</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
          <Target className="w-4 h-4 text-purple-600" />
          <div>
            <p className="text-sm font-medium text-purple-900">Evening Check-in</p>
            <p className="text-xs text-purple-700">8 PM progress review</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
          <Sparkles className="w-4 h-4 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-900">Pattern Recognition</p>
            <p className="text-xs text-green-700">Learns your habits</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
          <Bell className="w-4 h-4 text-orange-600" />
          <div>
            <p className="text-sm font-medium text-orange-900">Funny & Motivational</p>
            <p className="text-xs text-orange-700">Never boring!</p>
          </div>
        </div>
      </div>

      {/* Status & Actions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-sm font-medium">
              Status: {isEnabled ? 'Active' : 'Disabled'}
            </span>
          </div>
          <span className="text-xs text-gray-500 capitalize">{permission}</span>
        </div>

        <div className="flex gap-3">
          {!isEnabled && (
            <Button
              onClick={handleEnableNotifications}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              ) : (
                <Bell className="w-4 h-4 mr-2" />
              )}
              Enable Smart Notifications
            </Button>
          )}
          
          {isEnabled && (
            <Button
              onClick={handleTestNotification}
              variant="outline"
              className="flex-1"
            >
              <TestTube className="w-4 h-4 mr-2" />
              Send Test Notification
            </Button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-800">
          <strong>How it works:</strong> Our AI analyzes your completion patterns, streak length, and timing preferences to send personalized motivational messages that actually help you stay consistent.
        </p>
      </div>
    </div>
  );
}