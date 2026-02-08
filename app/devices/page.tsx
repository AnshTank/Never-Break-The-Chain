"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Monitor, Tablet, Trash2, Bell, BellOff } from "lucide-react";

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

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await fetch('/api/devices/list');
      if (response.ok) {
        const data = await response.json();
        setDevices(data.devices || []);
      }
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeDevice = async (deviceId: string) => {
    try {
      const response = await fetch('/api/devices/register', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId })
      });

      if (response.ok) {
        fetchDevices();
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

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">Loading devices...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Devices</h1>
        <p className="text-gray-600">Manage your registered devices and notifications</p>
      </div>

      {Object.entries(groupedDevices).map(([type, typeDevices]) => (
        <div key={type} className="mb-8">
          <h2 className="text-xl font-semibold mb-4 capitalize flex items-center gap-2">
            {getDeviceIcon(type)}
            {type} Devices ({typeDevices.length})
          </h2>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {typeDevices.map((device) => (
              <Card key={device.deviceId} className={device.isCurrentDevice ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg flex items-center gap-2 min-w-0 flex-1">
                      <span className="flex-shrink-0">{getDeviceIcon(device.deviceType)}</span>
                      <span className="truncate" title={device.deviceName}>{device.deviceName}</span>
                    </CardTitle>
                    {device.isCurrentDevice && (
                      <Badge variant="default" className="bg-blue-500 flex-shrink-0">Current</Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="truncate" title={device.browser}><span className="font-medium">Browser:</span> {device.browser}</div>
                    <div className="truncate" title={device.os}><span className="font-medium">OS:</span> {device.os}</div>
                    <div><span className="font-medium">Last active:</span> {new Date(device.lastActive).toLocaleDateString()}</div>
                    
                    <div className="flex items-center gap-2 mt-3 pt-2 border-t dark:border-gray-700">
                      {device.hasNotifications ? (
                        <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-2.5 py-1 rounded-md">
                          <Bell className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">Enabled</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-md">
                          <BellOff className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">Disabled</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-3">
                      {device.isCurrentDevice ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            removeDevice(device.deviceId);
                            window.location.href = '/login';
                          }}
                          className="w-full"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Logout
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeDevice(device.deviceId)}
                          className="w-full"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      )}
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
    </div>
  );
}