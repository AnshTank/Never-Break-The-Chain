// 'use client'

// import { useState, useEffect } from 'react'
// import { Bell, BellOff, Clock, Trophy, Settings } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import { Switch } from '@/components/ui/switch'
// import { Label } from '@/components/ui/label'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// interface NotificationSettings {
//   morningNotifications: boolean
//   eveningNotifications: boolean
//   reminderNotifications: boolean
//   milestoneNotifications: boolean
//   streakNotifications: boolean
//   inactivityReminders: boolean
//   morningTime: string
//   eveningTime: string
//   reminderInterval: number
//   weekendNotifications: boolean
// }

// export default function NotificationSettings() {
//   const [settings, setSettings] = useState<NotificationSettings>({
//     morningNotifications: true,
//     eveningNotifications: true,
//     reminderNotifications: true,
//     milestoneNotifications: true,
//     streakNotifications: true,
//     inactivityReminders: true,
//     morningTime: '07:00',
//     eveningTime: '20:00',
//     reminderInterval: 4,
//     weekendNotifications: true
//   })

//   const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default')
//   const [isLoading, setIsLoading] = useState(false)
//   const [lastSaved, setLastSaved] = useState<Date | null>(null)

//   useEffect(() => {
//     if ('Notification' in window) {
//       setPermissionStatus(Notification.permission)
//     }
//     loadSettings()
//   }, [])

//   const loadSettings = async () => {
//     try {
//       const response = await fetch('/api/settings/notifications')
//       if (response.ok) {
//         const data = await response.json()
//         if (data.settings) {
//           setSettings({ ...settings, ...data.settings })
//         }
//       }
//     } catch (error) {
//       console.error('Failed to load notification settings:', error)
//     }
//   }

//   const saveSettings = async () => {
//     setIsLoading(true)
//     try {
//       const response = await fetch('/api/settings/notifications', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ settings })
//       })

//       if (response.ok) {
//         setLastSaved(new Date())
//       }
//     } catch (error) {
//       console.error('Failed to save notification settings:', error)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const requestPermission = async () => {
//     if ('Notification' in window) {
//       const permission = await Notification.requestPermission()
//       setPermissionStatus(permission)

//       if (permission === 'granted') {
//         try {
//           const registration = await navigator.serviceWorker.register('/sw.js')
//           await navigator.serviceWorker.ready

//           if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
//             const subscription = await registration.pushManager.subscribe({
//               userVisibleOnly: true,
//               applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
//             })

//             await fetch('/api/notifications/subscribe', {
//               method: 'POST',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify({ subscription })
//             })
//           }
//         } catch (error) {
//           console.error('Failed to setup push notifications:', error)
//         }
//       }
//     }
//   }

//   const testNotification = async (type: string) => {
//     try {
//       const response = await fetch('/api/notifications/test', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ type })
//       })

//       if (response.ok) {
//         console.log(`Test ${type} notification sent`)
//       }
//     } catch (error) {
//       console.error('Failed to send test notification:', error)
//     }
//   }

//   const updateSetting = (key: keyof NotificationSettings, value: any) => {
//     setSettings(prev => ({ ...prev, [key]: value }))
//   }

//   return (
//     <div className="space-y-6">
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             {permissionStatus === 'granted' ? (
//               <Bell className="w-5 h-5 text-green-500" />
//             ) : (
//               <BellOff className="w-5 h-5 text-red-500" />
//             )}
//             Notification Permission
//           </CardTitle>
//           <CardDescription>
//             {permissionStatus === 'granted' && 'Notifications are enabled and working!'}
//             {permissionStatus === 'denied' && 'Notifications are blocked. Please enable them in your browser settings.'}
//             {permissionStatus === 'default' && 'Click below to enable notifications for your MNZD journey.'}
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           {permissionStatus !== 'granted' && (
//             <Button onClick={requestPermission} className="w-full">
//               <Bell className="w-4 h-4 mr-2" />
//               Enable Notifications
//             </Button>
//           )}

//           {permissionStatus === 'granted' && (
//             <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => testNotification('morning')}
//               >
//                 Morning
//               </Button>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => testNotification('evening')}
//               >
//                 Evening
//               </Button>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => testNotification('missed_day')}
//               >
//                 Missed
//               </Button>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => testNotification('milestone')}
//               >
//                 Milestone
//               </Button>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => testNotification('streak')}
//               >
//                 Streak
//               </Button>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Clock className="w-5 h-5 text-blue-500" />
//             Scheduled Notifications
//           </CardTitle>
//           <CardDescription>
//             Daily reminders to keep your chain strong
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="flex items-center justify-between">
//             <div className="space-y-1">
//               <Label htmlFor="morning-notifications">Morning Motivation</Label>
//               <p className="text-sm text-muted-foreground">
//                 Start your day with energy and purpose
//               </p>
//             </div>
//             <div className="flex items-center gap-2">
//               <input
//                 type="time"
//                 value={settings.morningTime}
//                 onChange={(e) => updateSetting('morningTime', e.target.value)}
//                 className="px-2 py-1 border rounded text-sm"
//                 disabled={!settings.morningNotifications}
//               />
//               <Switch
//                 id="morning-notifications"
//                 checked={settings.morningNotifications}
//                 onCheckedChange={(checked) => updateSetting('morningNotifications', checked)}
//               />
//             </div>
//           </div>

//           <div className="flex items-center justify-between">
//             <div className="space-y-1">
//               <Label htmlFor="evening-notifications">Evening Check-in</Label>
//               <p className="text-sm text-muted-foreground">
//                 Reflect on your progress and plan tomorrow
//               </p>
//             </div>
//             <div className="flex items-center gap-2">
//               <input
//                 type="time"
//                 value={settings.eveningTime}
//                 onChange={(e) => updateSetting('eveningTime', e.target.value)}
//                 className="px-2 py-1 border rounded text-sm"
//                 disabled={!settings.eveningNotifications}
//               />
//               <Switch
//                 id="evening-notifications"
//                 checked={settings.eveningNotifications}
//                 onCheckedChange={(checked) => updateSetting('eveningNotifications', checked)}
//               />
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Trophy className="w-5 h-5 text-yellow-500" />
//             Celebrations & Achievements
//           </CardTitle>
//           <CardDescription>
//             Never miss a milestone or streak celebration
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="flex items-center justify-between">
//             <div className="space-y-1">
//               <Label htmlFor="milestone-notifications">Milestone Achievements</Label>
//               <p className="text-sm text-muted-foreground">
//                 Celebrate your major accomplishments
//               </p>
//             </div>
//             <Switch
//               id="milestone-notifications"
//               checked={settings.milestoneNotifications}
//               onCheckedChange={(checked) => updateSetting('milestoneNotifications', checked)}
//             />
//           </div>

//           <div className="flex items-center justify-between">
//             <div className="space-y-1">
//               <Label htmlFor="streak-notifications">Streak Celebrations</Label>
//               <p className="text-sm text-muted-foreground">
//                 Acknowledge your consistency wins
//               </p>
//             </div>
//             <Switch
//               id="streak-notifications"
//               checked={settings.streakNotifications}
//               onCheckedChange={(checked) => updateSetting('streakNotifications', checked)}
//             />
//           </div>
//         </CardContent>
//       </Card>

//       <div className="flex items-center justify-between">
//         <div className="text-sm text-muted-foreground">
//           {lastSaved && `Last saved: ${lastSaved.toLocaleTimeString()}`}
//         </div>
//         <Button onClick={saveSettings} disabled={isLoading}>
//           {isLoading ? 'Saving...' : 'Save Settings'}
//         </Button>
//       </div>
//     </div>
//   )
// }
"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  BellOff,
  TestTube,
  Sparkles,
  X,
  Lock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/lib/notifications/use-notifications";
import { toast } from "sonner";

interface NotificationSettingsProps {
  onDisableNotifications?: () => void;
}

export default function NotificationSettings({
  onDisableNotifications,
}: NotificationSettingsProps) {
  const {
    isEnabled,
    permission,
    enableNotifications,
    sendTestNotification,
    disableWebsiteNotifications,
    isWebsiteNotificationsEnabled,
  } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);
  const [websiteEnabled, setWebsiteEnabled] = useState(true);
  const [currentPermission, setCurrentPermission] =
    useState<NotificationPermission>("default");

  useEffect(() => {
    setWebsiteEnabled(isWebsiteNotificationsEnabled());

    // Check current permission state
    if (typeof window !== "undefined" && "Notification" in window) {
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
    if (currentPermission === "denied") {
      toast.error(
        "Notifications are blocked. Please click the 🔒 icon in your browser address bar and allow notifications, then refresh the page.",
        { duration: 6000 },
      );
      return;
    }

    if (currentPermission === "granted") {
      toast.info("Notifications are already enabled!");
      return;
    }

    setIsLoading(true);
    try {
      const granted = await enableNotifications();
      if (granted) {
        setCurrentPermission("granted");
        toast.success("🎉 Smart notifications enabled!");
      } else {
        setCurrentPermission(Notification.permission);
        if (Notification.permission === "denied") {
          toast.error(
            "Notifications were blocked. Please click the 🔒 icon in your browser address bar and allow notifications.",
            { duration: 6000 },
          );
        } else {
          toast.error(
            "Please allow notifications when prompted by your browser.",
          );
        }
      }
    } catch (error) {
      console.error("Failed to enable notifications:", error);
      toast.error("Failed to enable notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleWebsiteNotifications = () => {
    if (websiteEnabled) {
      disableWebsiteNotifications();
      setWebsiteEnabled(false);
      toast.success("Website notifications disabled");
      onDisableNotifications?.();
    } else {
      // Re-enable website notifications
      localStorage.removeItem("websiteNotificationsDisabled");
      setWebsiteEnabled(true);
      toast.success("Website notifications enabled");
    }
  };

  const handleTestNotification = async () => {
    if (currentPermission !== "granted") {
      toast.error("Please enable browser notifications first");
      return;
    }

    if (!websiteEnabled) {
      toast.error("Website notifications are disabled");
      return;
    }

    try {
      await sendTestNotification();
      toast.success("Test notification sent!");
    } catch (error) {
      toast.error("Failed to send test notification");
    }
  };

  const getPermissionStatus = () => {
    switch (currentPermission) {
      case "granted":
        return { color: "green", text: "Enabled", icon: Bell };
      case "denied":
        return { color: "red", text: "Blocked", icon: Lock };
      default:
        return { color: "gray", text: "Not Set", icon: AlertCircle };
    }
  };

  const getButtonConfig = () => {
    switch (currentPermission) {
      case "granted":
        return {
          text: "Notifications Enabled",
          disabled: true,
          className: "bg-green-500 hover:bg-green-600 cursor-default",
          icon: Bell,
        };
      case "denied":
        return {
          text: "Enable in Browser Settings",
          disabled: false,
          className: "bg-red-500 hover:bg-red-600",
          icon: Lock,
        };
      default:
        return {
          text: "Enable Browser Notifications",
          disabled: false,
          className:
            "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600",
          icon: Bell,
        };
    }
  };

  if (!("Notification" in window)) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <BellOff className="w-5 h-5 text-gray-400" />
          <h3 className="font-semibold text-gray-700">
            Notifications Not Supported
          </h3>
        </div>
        <p className="text-sm text-gray-600">
          Your browser doesn't support notifications. Try using Chrome, Firefox,
          or Safari.
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
          <p className="text-sm text-gray-600">
            Get personalized reminders to stay consistent
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-900">
              Daily Motivation
            </p>
            <p className="text-xs text-blue-700">Morning & evening</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
          <Bell className="w-4 h-4 text-purple-600" />
          <div>
            <p className="text-sm font-medium text-purple-900">
              Smart Reminders
            </p>
            <p className="text-xs text-purple-700">Learns your patterns</p>
          </div>
        </div>
      </div>

      {/* Status & Actions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full bg-${permissionStatus.color}-500`}
            />
            <span className="text-sm font-medium">
              Browser: {permissionStatus.text}
            </span>
            <permissionStatus.icon
              className={`w-3 h-3 text-${permissionStatus.color}-500`}
            />
          </div>
          {currentPermission === "denied" && (
            <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
              Check browser settings
            </span>
          )}
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${websiteEnabled ? "bg-green-500" : "bg-red-500"}`}
            />
            <span className="text-sm font-medium">
              Website: {websiteEnabled ? "Enabled" : "Disabled"}
            </span>
          </div>
          <Button
            onClick={handleToggleWebsiteNotifications}
            variant="outline"
            size="sm"
            className={
              websiteEnabled
                ? "text-red-600 hover:text-red-700"
                : "text-green-600 hover:text-green-700"
            }
          >
            {websiteEnabled ? (
              <>
                <X className="w-3 h-3 mr-1" /> Disable
              </>
            ) : (
              <>
                <Bell className="w-3 h-3 mr-1" /> Enable
              </>
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

          {currentPermission === "granted" && websiteEnabled && (
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
      {currentPermission === "denied" && (
        <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
          <p className="text-xs text-red-800">
            <strong>Notifications Blocked:</strong> Click the 🔒 lock icon in
            your browser's address bar, find "Notifications" and change it to
            "Allow", then refresh this page.
          </p>
        </div>
      )}

      {currentPermission === "default" && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-800">
            <strong>Ready to Enable:</strong> Click the button above and allow
            notifications when your browser asks. You'll get smart, personalized
            reminders to help you stay consistent.
          </p>
        </div>
      )}

      {currentPermission === "granted" && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-xs text-green-800">
            <strong>All Set!</strong> You'll receive personalized motivational
            messages that adapt to your habits and help you maintain your daily
            consistency.
          </p>
        </div>
      )}
    </div>
  );
}
