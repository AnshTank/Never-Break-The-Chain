'use client'

import { useState } from 'react';
import { Bell, BellOff, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/lib/notifications/use-notifications';

interface NotificationPermissionStepProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function NotificationPermissionStep({ onComplete, onSkip }: NotificationPermissionStepProps) {
  const { requestPermission, sendWelcomeNotification } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);
  const [isGranted, setIsGranted] = useState(false);

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    try {
      const granted = await requestPermission();
      if (granted) {
        setIsGranted(true);
        // Send welcome notification after permission is granted
        setTimeout(async () => {
          await sendWelcomeNotification();
          onComplete();
        }, 500);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      setIsLoading(false);
    }
  };

  if (isGranted) {
    return (
      <div className="text-center space-y-6">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-xl font-semibold">Perfect! Notifications Enabled</h3>
        <p className="text-muted-foreground">
          You'll receive smart reminders to help you stay consistent with your habits.
        </p>
        <div className="flex items-center justify-center gap-2 text-green-600">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Welcome notification sent!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center space-y-6">
      <div className="text-6xl mb-4">🔔</div>
      <h3 className="text-xl font-semibold">Stay Motivated with Smart Notifications</h3>
      <p className="text-muted-foreground">
        Get personalized reminders that adapt to your habits and help you maintain your chain.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl mb-2">🌅</div>
          <h4 className="font-semibold text-sm">Morning Motivation</h4>
          <p className="text-xs text-muted-foreground">Daily boost at 7 AM</p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl mb-2">🎯</div>
          <h4 className="font-semibold text-sm">Evening Check-ins</h4>
          <p className="text-xs text-muted-foreground">Progress review at 8 PM</p>
        </div>
      </div>

      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
        <p className="text-sm text-amber-800">
          <strong>Your browser will ask for permission.</strong> Click "Allow" to enable smart notifications that help you stay consistent.
        </p>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onSkip}
          className="flex-1"
        >
          <BellOff className="w-4 h-4 mr-2" />
          Skip for Now
        </Button>
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
          {isLoading ? 'Requesting...' : 'Enable Notifications'}
        </Button>
      </div>
    </div>
  );
}