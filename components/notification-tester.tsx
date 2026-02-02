'use client';

import { useState } from 'react';
import { Bell, Send, TestTube } from 'lucide-react';

export default function NotificationTester() {
  const [isTesting, setIsTesting] = useState(false);
  const [lastResult, setLastResult] = useState<string>('');
  const [isCleaningDevices, setIsCleaningDevices] = useState(false);

  const testNotification = async (type: 'morning' | 'evening' | 'missed_day' | 'milestone' | 'streak') => {
    setIsTesting(true);
    setLastResult('');

    try {
      const authCheck = await fetch('/api/user');
      if (!authCheck.ok) {
        setLastResult('❌ Please login first to test notifications');
        setIsTesting(false);
        return;
      }

      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });

      const result = await response.json();
      console.log('Notification test result:', result);
      
      if (response.ok) {
        const sent = result.sent || 0;
        const failed = result.failed || 0;
        setLastResult(`✅ Sent to ${sent} devices, ${failed} failed`);
      } else {
        setLastResult(`❌ Error: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      setLastResult(`❌ Network error: ${error}`);
    } finally {
      setIsTesting(false);
    }
  };

  const cleanupDevices = async () => {
    setIsCleaningDevices(true);
    try {
      const response = await fetch('/api/devices/cleanup-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      if (response.ok) {
        setLastResult(`🧹 Cleaned up ${result.deletedCount} devices. Please refresh and login again.`);
      } else {
        setLastResult(`❌ Cleanup failed: ${result.message}`);
      }
    } catch (error) {
      setLastResult(`❌ Cleanup error: ${error}`);
    } finally {
      setIsCleaningDevices(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
      <div className="flex items-center gap-2 mb-4">
        <TestTube className="w-5 h-5 text-blue-500" />
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Test Notifications
        </h3>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          <button
            onClick={() => testNotification('morning')}
            disabled={isTesting}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg disabled:opacity-50 text-sm"
          >
            <Bell className="w-4 h-4" />
            Morning
          </button>
          
          <button
            onClick={() => testNotification('evening')}
            disabled={isTesting}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg disabled:opacity-50 text-sm"
          >
            <Bell className="w-4 h-4" />
            Evening
          </button>
          
          <button
            onClick={() => testNotification('missed_day')}
            disabled={isTesting}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg disabled:opacity-50 text-sm"
          >
            <Bell className="w-4 h-4" />
            Missed Day
          </button>
          
          <button
            onClick={() => testNotification('milestone')}
            disabled={isTesting}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg disabled:opacity-50 text-sm"
          >
            <Bell className="w-4 h-4" />
            Milestone
          </button>
          
          <button
            onClick={() => testNotification('streak')}
            disabled={isTesting}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 text-sm"
          >
            <Bell className="w-4 h-4" />
            Streak
          </button>
        </div>

        {isTesting && (
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            Sending notification...
          </div>
        )}

        {lastResult && (
          <div className="text-sm p-2 bg-gray-50 dark:bg-slate-700 rounded border">
            {lastResult}
          </div>
        )}

        <div className="text-xs text-gray-500 dark:text-gray-400">
          💡 Make sure you've granted notification permission and registered this device
        </div>
        
        <div className="text-xs p-2 bg-blue-50 dark:bg-blue-900/20 rounded border">
          🔄 Device registration happens automatically when you login. Check browser console for details.
        </div>
        
        <div className="pt-2 border-t">
          <button
            onClick={cleanupDevices}
            disabled={isCleaningDevices}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg disabled:opacity-50 text-sm"
          >
            {isCleaningDevices ? '🧹 Cleaning...' : '🧹 Reset All Devices'}
          </button>
          <p className="text-xs text-gray-500 mt-1 text-center">
            Use this if you can't login due to device issues
          </p>
        </div>
      </div>
    </div>
  );
}