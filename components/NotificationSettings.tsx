"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, Mail, TestTube } from "lucide-react";

export default function NotificationSettings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/user/settings');
      if (response.ok) {
        const data = await response.json();
        setEmailNotifications(data.emailNotifications);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const handleToggleEmail = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailNotifications: !emailNotifications })
      });
      
      if (response.ok) {
        setEmailNotifications(!emailNotifications);
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    setTestLoading(true);
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'test' })
      });
      
      if (response.ok) {
        alert('Test email sent! Check your inbox.');
      } else {
        alert('Failed to send test email.');
      }
    } catch (error) {
      console.error('Failed to send test email:', error);
      alert('Failed to send test email.');
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Daily Reminders</h3>
              <p className="text-sm text-gray-600">Receive email reminders for your habit tracking</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={emailNotifications ? "default" : "outline"}>
                {emailNotifications ? (
                  <><Bell className="w-3 h-3 mr-1" /> Enabled</>
                ) : (
                  <><BellOff className="w-3 h-3 mr-1" /> Disabled</>
                )}
              </Badge>
              <Button
                onClick={handleToggleEmail}
                disabled={loading}
                variant={emailNotifications ? "destructive" : "default"}
                size="sm"
              >
                {loading ? "Updating..." : emailNotifications ? "Disable" : "Enable"}
              </Button>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <Button
              onClick={handleTestEmail}
              disabled={testLoading || !emailNotifications}
              variant="outline"
              className="w-full"
            >
              <TestTube className="w-4 h-4 mr-2" />
              {testLoading ? "Sending..." : "Send Test Email"}
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Test emails are sent via external cron service
            </p>
          </div>
        </CardContent>
      </Card>


    </div>
  );
}