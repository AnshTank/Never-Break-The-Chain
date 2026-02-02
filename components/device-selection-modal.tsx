'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Monitor, Tablet, Clock, Globe } from 'lucide-react';

interface BrowserSession {
  browser: string;
  sessionId: string;
  lastActive: string;
}

interface Device {
  deviceId: string;
  physicalDeviceId?: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  lastActive: string;
  browserSessions?: BrowserSession[];
}

interface DeviceSelectionModalProps {
  isOpen: boolean;
  devices: Device[];
  onDeviceRemove: (deviceId: string) => void;
  onCancel: () => void;
}

export default function DeviceSelectionModal({
  isOpen,
  devices,
  onDeviceRemove,
  onCancel,
}: DeviceSelectionModalProps) {
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [isRemoving, setIsRemoving] = useState(false);

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile': return <Smartphone className="w-6 h-6" />;
      case 'tablet': return <Tablet className="w-6 h-6" />;
      default: return <Monitor className="w-6 h-6" />;
    }
  };

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getBrowserList = (browserSessions?: BrowserSession[]) => {
    if (!browserSessions || browserSessions.length <= 1) return null;
    
    const browsers = browserSessions.map(session => 
      session.browser.split(' ')[0] // Get browser name without version
    ).filter((browser, index, arr) => 
      arr.indexOf(browser) === index // Remove duplicates
    );
    
    return browsers.join(', ');
  };

  const handleRemoveDevice = async () => {
    if (!selectedDevice) return;
    
    setIsRemoving(true);
    try {
      const response = await fetch('/api/devices/register', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceIdToRemove: selectedDevice })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // If this was the current device, redirect to login
        if (data.shouldLogout) {
          localStorage.clear();
          window.location.href = data.redirect || '/login?message=Device removed successfully';
          return;
        }
        
        // Otherwise call the parent handler
        await onDeviceRemove(selectedDevice);
      }
    } catch (error) {
      console.error('Failed to remove device:', error);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-xl"
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Device Limit Reached
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                You can only have 2 active devices. Please select a device to remove before adding this new one.
              </p>

              <div className="space-y-3 mb-6">
                {devices.map((device) => {
                  const browserList = getBrowserList(device.browserSessions);
                  
                  return (
                    <div
                      key={device.deviceId}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedDevice === device.deviceId
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => setSelectedDevice(device.deviceId)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-gray-600 dark:text-gray-400">
                          {getDeviceIcon(device.deviceType)}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {device.deviceName}
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                              <Clock className="w-3 h-3" />
                              {formatLastActive(device.lastActive)}
                            </div>
                            {browserList && (
                              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                <Globe className="w-3 h-3" />
                                <span>{browserList}</span>
                              </div>
                            )}
                          </div>
                          {device.browserSessions && device.browserSessions.length > 1 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {device.browserSessions.length} browser sessions
                            </div>
                          )}
                        </div>
                        {selectedDevice === device.deviceId && (
                          <div className="text-red-500">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemoveDevice}
                  disabled={!selectedDevice || isRemoving}
                  className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isRemoving ? 'Removing...' : 'Remove Device'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}