'use client';

import { useState, useEffect } from 'react';
import { Smartphone, Monitor, Tablet, Trash2, Wifi, WifiOff, Clock, Globe, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { getDeviceId } from '@/lib/device-id';

interface Device {
  deviceId: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  lastActive: string;
  lastLogin: string;
  registeredAt: string;
  hasNotifications: boolean;
  rememberMe: boolean;
  rememberMeExpiry?: string;
}

export default function DeviceManagerComponent() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [deviceToRemove, setDeviceToRemove] = useState<Device | null>(null);
  const [currentDeviceId, setCurrentDeviceId] = useState<string>('');

  useEffect(() => {
    fetchDevices();
    loadCurrentDeviceId();
  }, []);

  const loadCurrentDeviceId = () => {
    const deviceId = getDeviceId();
    setCurrentDeviceId(deviceId);
  };

  const fetchDevices = async () => {
    try {
      const response = await fetch('/api/devices/list');
      if (response.ok) {
        const data = await response.json();
        setDevices(data.devices);
      }
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeDevice = async (device: Device) => {
    setRemoving(device.deviceId);
    try {
      const currentDeviceId = getDeviceId();
      
      const response = await fetch('/api/devices/register', {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'x-device-id': currentDeviceId
        },
        body: JSON.stringify({ 
          deviceIdToRemove: device.deviceId
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.shouldLogout) {
          try {
            localStorage.clear();
          } catch {
            // Ignore localStorage errors
          }
          window.location.href = data.redirect || '/login?message=Device removed successfully';
          return;
        }
        
        setDevices(devices.filter(d => d.deviceId !== device.deviceId));
      }
    } catch (error) {
      console.error('Failed to remove device:', error);
    } finally {
      setRemoving(null);
      setDeviceToRemove(null);
    }
  };

  const logoutThisDevice = async () => {
    const currentDeviceId = getDeviceId();
    if (!currentDeviceId) return;

    try {
      const response = await fetch('/api/devices/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: currentDeviceId })
      });

      if (response.ok) {
        try {
          localStorage.clear();
        } catch {
          // Ignore localStorage errors
        }
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Failed to logout device:', error);
      try {
        localStorage.clear();
      } catch {
        // Ignore localStorage errors
      }
      window.location.href = '/login';
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Active now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };



  const isCurrentDevice = (device: Device) => {
    return device.deviceId === currentDeviceId;
  };

  const getBrowserList = (browserSessions?: any[]) => {
    return null; // Simplified - no browser sessions
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Registered Devices</h3>
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-16 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          Registered Devices ({devices.length}/2)
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Notifications enabled on all devices
        </span>
      </div>

      <div className="space-y-2">
        {devices.map((device) => {
          const isThisDevice = isCurrentDevice(device);
          const browserList = getBrowserList();
          
          return (
            <div
              key={device.deviceId}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                isThisDevice
                  ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                  : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`${isThisDevice ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
                  {getDeviceIcon(device.deviceType)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span 
                      className={`text-sm font-medium truncate cursor-help ${isThisDevice ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'}`}
                      title={device.deviceName}
                    >
                      {device.deviceName}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="w-3 h-3" />
                      {formatLastActive(device.lastActive)}
                    </div>
                    
                    {browserList && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Globe className="w-3 h-3" />
                        <span>{browserList}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1 text-xs">
                      {device.hasNotifications ? (
                        <>
                          <Wifi className="w-3 h-3 text-green-500" />
                          <span className="text-green-600 dark:text-green-400">Notifications</span>
                        </>
                      ) : (
                        <>
                          <WifiOff className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-500">No notifications</span>
                        </>
                      )}
                    </div>
                    
                    {device.rememberMe && (
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        📱 Remembered
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {!isThisDevice && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      disabled={removing === device.deviceId}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                      title="Remove device"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        Remove Device?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to remove <strong>{device.deviceName}</strong>? 
                        This will immediately log out all sessions on this device and cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => removeDevice(device)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {removing === device.deviceId ? 'Removing...' : 'Remove Device'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              
              {isThisDevice && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="px-3 py-1.5 text-xs bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40 rounded transition-colors">
                      Logout
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        Logout from this device?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        You will be logged out from this device and redirected to the login page.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={logoutThisDevice}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Logout
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          );
        })}
      </div>

      {devices.length === 0 && (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
          No devices registered. Refresh the page to register this device.
        </div>
      )}

      <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-2 rounded">
        💡 You can have up to 2 devices. Multiple browsers on the same device are grouped together. Notifications are sent to all registered devices.
      </div>
    </div>
  );
}