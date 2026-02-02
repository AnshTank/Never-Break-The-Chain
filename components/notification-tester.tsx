'use client';

import { useState } from 'react';
import { Bell, Send, TestTube } from 'lucide-react';

export default function NotificationTester() {
  const [isTesting, setIsTesting] = useState(false);
  const [lastResult, setLastResult] = useState<string>('');

  const testNotification = async (type: 'morning' | 'evening' | 'missed_day') => {
    setIsTesting(true);
    setLastResult('');

    try {
      // Check if user is logged in first
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
      
      if (response.ok) {
        setLastResult(`✅ Sent to ${result.sent} devices, ${result.failed} failed`);
      } else {
        setLastResult(`❌ Error: ${result.message}`);
      }
    } catch (error) {
      setLastResult(`❌ Network error: ${error}`);
    } finally {
      setIsTesting(false);
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
      </div>
    </div>
  );
}