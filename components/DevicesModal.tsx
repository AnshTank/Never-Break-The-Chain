"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Monitor, Tablet, Trash2, Bell, BellOff, X } from "lucide-react";

interface Device {
  deviceId: string;
  deviceName: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  os: string;
  lastActive: string;
  isCurrentDevice: boolean;
  hasNotifications: boolean;
}

interface DevicesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DevicesModal({ isOpen, onClose }: DevicesModalProps) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchDevices();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const fetchDevices = async () => {
    try {
      const response = await fetch('/api/devices/list');
      if (response.ok) {
        const data = await response.json();
        
        // Get current device ID from multiple sources
        let currentDeviceId = localStorage.getItem('device-id') || 
                             localStorage.getItem('device_id') ||
                             document.cookie.split('; ').find(row => row.startsWith('device-id='))?.split('=')[1] ||
                             document.cookie.split('; ').find(row => row.startsWith('device_id='))?.split('=')[1];
        
        // If still no device ID, generate one
        if (!currentDeviceId) {
          const { getDeviceId } = await import('@/lib/device-id');
          currentDeviceId = getDeviceId();
        }
        
        const devicesWithStatus = data.devices.map((device: any) => ({
          ...device,
          isCurrentDevice: device.deviceId === currentDeviceId,
          hasNotifications: data.emailNotifications !== false
        }));
        
        setDevices(devicesWithStatus);
      }
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeDevice = async (deviceId: string, isCurrentDevice: boolean) => {
    try {
      const response = await fetch('/api/devices/register', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId })
      });

      if (response.ok) {
        if (isCurrentDevice) {
          // Clear all auth data and redirect to login
          document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          document.cookie = 'refresh-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          document.cookie = 'device-id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          localStorage.clear();
          window.location.href = '/login';
        } else {
          fetchDevices();
        }
      }
    } catch (error) {
      console.error('Failed to remove device:', error);
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile': return <Smartphone className="w-5 h-5" />;
      case 'tablet': return <Tablet className="w-5 h-5" />;
      default: return <Monitor className="w-5 h-5" />;
    }
  };

  const groupedDevices = devices.reduce((acc, device) => {
    if (!acc[device.deviceType]) acc[device.deviceType] = [];
    acc[device.deviceType].push(device);
    return acc;
  }, {} as Record<string, Device[]>);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-6xl max-h-[85vh] bg-white dark:bg-slate-800 rounded-xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-slate-700">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">My Devices</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage your registered devices</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 100px)' }}>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading devices...</p>
            </div>
          ) : (
            <>
              {Object.entries(groupedDevices).map(([type, typeDevices]) => (
                <div key={type} className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 capitalize flex items-center gap-2">
                    {getDeviceIcon(type)}
                    {type} Devices ({typeDevices.length})
                  </h3>
                  
                  <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {typeDevices.map((device) => (
                      <Card key={device.deviceId} className={`${device.isCurrentDevice ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : ""} transition-all hover:shadow-md`}>
                        <CardHeader className="pb-2 sm:pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm sm:text-lg flex items-center gap-2">
                              {getDeviceIcon(device.deviceType)}
                              <span className="truncate">{device.deviceName}</span>
                            </CardTitle>
                            {device.isCurrentDevice && (
                              <Badge variant="default" className="bg-blue-500 text-xs">Current</Badge>
                            )}
                          </div>
                        </CardHeader>
                        
                        <CardContent>
                          <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            <div className="truncate">Browser: {device.browser}</div>
                            <div className="truncate">OS: {device.os}</div>
                            <div>Last: {new Date(device.lastActive).toLocaleDateString()}</div>
                            
                            <div className="flex items-center gap-2 mt-3">
                              {device.hasNotifications ? (
                                <Badge variant="secondary" className="text-green-600">
                                  <Bell className="w-3 h-3 mr-1" />
                                  Email Enabled
                                </Badge>
                              ) : (
                                <Badge variant="outline">
                                  <BellOff className="w-3 h-3 mr-1" />
                                  Email Disabled
                                </Badge>
                              )}
                            </div>
                            
                            <div className="pt-3">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removeDevice(device.deviceId, device.isCurrentDevice)}
                                className="w-full"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                {device.isCurrentDevice ? 'Logout' : 'Remove'}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}

              {devices.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">No devices registered</p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}