'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'
import { Loader2, Bell, Mail, Smartphone, Clock, Target, Flame } from 'lucide-react'

interface NotificationPreferences {
  morningReminder: { enabled: boolean; time: string }
  eveningReminder: { enabled: boolean; time: string }
  missedDayReminder: { enabled: boolean }
  milestoneAlerts: { enabled: boolean }
  streakAlerts: { enabled: boolean }
  emailNotifications: { enabled: boolean }
  pushNotifications: { enabled: boolean }
}

export default function NotificationSettingsAdvanced() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    morningReminder: { enabled: true, time: '07:00' },
    eveningReminder: { enabled: true, time: '20:00' },
    missedDayReminder: { enabled: true },
    milestoneAlerts: { enabled: true },
    streakAlerts: { enabled: true },
    emailNotifications: { enabled: true },
    pushNotifications: { enabled: true }
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    loadPreferences()
    checkPushPermission()
  }, [])

  const loadPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences')
      if (response.ok) {
        const data = await response.json()
        setPreferences(data.preferences)
      }
    } catch (error) {
      console.error('Failed to load preferences:', error)
      toast({
        title: 'Error',
        description: 'Failed to load notification preferences',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const checkPushPermission = () => {
    if ('Notification' in window) {
      setPushPermission(Notification.permission)
    }
  }

  const requestPushPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setPushPermission(permission)
      
      if (permission === 'granted') {
        toast({
          title: 'Success',
          description: 'Push notifications enabled successfully!'
        })
        // Update push subscription
        try {
          const { updateDevicePushSubscription } = await import('@/lib/device-registration')
          await updateDevicePushSubscription()
        } catch (error) {
          console.warn('Failed to update push subscription:', error)
        }
      } else {
        toast({
          title: 'Permission Denied',
          description: 'Push notifications require browser permission',
          variant: 'destructive'
        })
      }
    }
  }

  const savePreferences = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Notification preferences saved successfully!'
        })
      } else {
        throw new Error('Failed to save preferences')
      }
    } catch (error) {
      console.error('Failed to save preferences:', error)
      toast({
        title: 'Error',
        description: 'Failed to save notification preferences',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const testNotification = async (type: string) => {
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: 'Test Sent',
          description: `${result.message}`,
        })
      } else {
        throw new Error('Failed to send test notification')
      }
    } catch (error) {
      console.error('Test notification failed:', error)
      toast({
        title: 'Error',
        description: 'Failed to send test notification',
        variant: 'destructive'
      })
    }
  }

  const updatePreference = (key: keyof NotificationPreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: typeof prev[key] === 'object' ? { ...prev[key], ...value } : value
    }))
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading notification settings...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Delivery Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Delivery Channels
          </CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-blue-500" />
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Reliable delivery even when offline</p>
              </div>
            </div>
            <Switch
              checked={preferences.emailNotifications.enabled}
              onCheckedChange={(checked) => updatePreference('emailNotifications', { enabled: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-4 w-4 text-green-500" />
              <div>
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  {pushPermission === 'granted' ? 'Real-time browser notifications' : 'Requires browser permission'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {pushPermission !== 'granted' && (
                <Button size="sm" variant="outline" onClick={requestPushPermission}>
                  Enable
                </Button>
              )}
              <Switch
                checked={preferences.pushNotifications.enabled && pushPermission === 'granted'}
                onCheckedChange={(checked) => updatePreference('pushNotifications', { enabled: checked })}
                disabled={pushPermission !== 'granted'}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Daily Reminders
          </CardTitle>
          <CardDescription>
            Automated reminders to keep your chain strong
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label>Morning Motivation (7 AM)</Label>
              <p className="text-sm text-muted-foreground">Start your day with inspiration</p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="time"
                value={preferences.morningReminder.time}
                onChange={(e) => updatePreference('morningReminder', { time: e.target.value })}
                className="w-24"
                disabled={!preferences.morningReminder.enabled}
              />
              <Switch
                checked={preferences.morningReminder.enabled}
                onCheckedChange={(checked) => updatePreference('morningReminder', { enabled: checked })}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label>Evening Check-in (8 PM)</Label>
              <p className="text-sm text-muted-foreground">Reflect on your daily progress</p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="time"
                value={preferences.eveningReminder.time}
                onChange={(e) => updatePreference('eveningReminder', { time: e.target.value })}
                className="w-24"
                disabled={!preferences.eveningReminder.enabled}
              />
              <Switch
                checked={preferences.eveningReminder.enabled}
                onCheckedChange={(checked) => updatePreference('eveningReminder', { enabled: checked })}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Missed Day Reminders</Label>
              <p className="text-sm text-muted-foreground">Gentle nudges to get back on track</p>
            </div>
            <Switch
              checked={preferences.missedDayReminder.enabled}
              onCheckedChange={(checked) => updatePreference('missedDayReminder', { enabled: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Achievement Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Achievement Alerts
          </CardTitle>
          <CardDescription>
            Celebrate your milestones and streaks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="h-4 w-4 text-yellow-500" />
              <div>
                <Label>Milestone Celebrations</Label>
                <p className="text-sm text-muted-foreground">7, 14, 30, 60, 100+ day achievements</p>
              </div>
            </div>
            <Switch
              checked={preferences.milestoneAlerts.enabled}
              onCheckedChange={(checked) => updatePreference('milestoneAlerts', { enabled: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Flame className="h-4 w-4 text-orange-500" />
              <div>
                <Label>Streak Alerts</Label>
                <p className="text-sm text-muted-foreground">Weekly streak celebrations</p>
              </div>
            </div>
            <Switch
              checked={preferences.streakAlerts.enabled}
              onCheckedChange={(checked) => updatePreference('streakAlerts', { enabled: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Test Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Test Notifications</CardTitle>
          <CardDescription>
            Send test notifications to verify your settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <Button size="sm" variant="outline" onClick={() => testNotification('morning')}>
              Morning
            </Button>
            <Button size="sm" variant="outline" onClick={() => testNotification('evening')}>
              Evening
            </Button>
            <Button size="sm" variant="outline" onClick={() => testNotification('missed_day')}>
              Missed Day
            </Button>
            <Button size="sm" variant="outline" onClick={() => testNotification('milestone')}>
              Milestone
            </Button>
            <Button size="sm" variant="outline" onClick={() => testNotification('streak')}>
              Streak
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={savePreferences} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Preferences
        </Button>
      </div>
    </div>
  )
}