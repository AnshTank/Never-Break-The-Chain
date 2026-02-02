'use client'

import { useState, useEffect } from 'react'
import { Bell, CheckCircle, XCircle, AlertCircle, Smartphone, Globe, TestTube } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface TestResult {
  test: string
  status: 'pending' | 'success' | 'error'
  message: string
  details?: any
}

export default function NotificationSystemTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [deviceInfo, setDeviceInfo] = useState<any>(null)

  const updateTest = (testName: string, status: 'pending' | 'success' | 'error', message: string, details?: any) => {
    setTestResults(prev => {
      const existing = prev.find(t => t.test === testName)
      if (existing) {
        existing.status = status
        existing.message = message
        existing.details = details
        return [...prev]
      } else {
        return [...prev, { test: testName, status, message, details }]
      }
    })
  }

  const runComprehensiveTest = async () => {
    setIsRunning(true)
    setTestResults([])

    // Test 1: Browser Support
    updateTest('Browser Support', 'pending', 'Checking browser capabilities...')
    try {
      const hasNotifications = 'Notification' in window
      const hasServiceWorker = 'serviceWorker' in navigator
      const hasPushManager = 'PushManager' in window
      
      if (hasNotifications && hasServiceWorker && hasPushManager) {
        updateTest('Browser Support', 'success', 'All required APIs supported', {
          notifications: hasNotifications,
          serviceWorker: hasServiceWorker,
          pushManager: hasPushManager
        })
      } else {
        updateTest('Browser Support', 'error', 'Missing required browser APIs', {
          notifications: hasNotifications,
          serviceWorker: hasServiceWorker,
          pushManager: hasPushManager
        })
      }
    } catch (error) {
      updateTest('Browser Support', 'error', `Browser check failed: ${error}`)
    }

    // Test 2: Permission Status
    updateTest('Permission Status', 'pending', 'Checking notification permission...')
    try {
      const permission = Notification.permission
      updateTest('Permission Status', permission === 'granted' ? 'success' : 'error', 
        `Permission: ${permission}`, { permission })
    } catch (error) {
      updateTest('Permission Status', 'error', `Permission check failed: ${error}`)
    }

    // Test 3: Service Worker Registration
    updateTest('Service Worker', 'pending', 'Checking service worker...')
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/sw.js')
        await navigator.serviceWorker.ready
        updateTest('Service Worker', 'success', 'Service worker registered and ready', {
          scope: registration.scope,
          active: !!registration.active
        })
      } else {
        updateTest('Service Worker', 'error', 'Service Worker not supported')
      }
    } catch (error) {
      updateTest('Service Worker', 'error', `Service worker registration failed: ${error}`)
    }

    // Test 4: VAPID Configuration
    updateTest('VAPID Keys', 'pending', 'Checking VAPID configuration...')
    try {
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (publicKey && publicKey.length > 0) {
        updateTest('VAPID Keys', 'success', 'VAPID public key configured', {
          keyLength: publicKey.length,
          keyPreview: publicKey.substring(0, 20) + '...'
        })
      } else {
        updateTest('VAPID Keys', 'error', 'VAPID public key not configured')
      }
    } catch (error) {
      updateTest('VAPID Keys', 'error', `VAPID check failed: ${error}`)
    }

    // Test 5: Device Registration
    updateTest('Device Registration', 'pending', 'Testing device registration...')
    try {
      const deviceId = localStorage.getItem('device-id') || 'test-device-' + Date.now()
      const response = await fetch('/api/devices/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-device-id': deviceId
        },
        body: JSON.stringify({
          deviceId,
          deviceName: 'Test Device',
          deviceType: 'desktop',
          browser: 'Test Browser',
          os: 'Test OS',
          rememberMe: false
        })
      })
      
      const result = await response.json()
      if (response.ok) {
        updateTest('Device Registration', 'success', 'Device registered successfully', result)
        setDeviceInfo(result)
      } else {
        updateTest('Device Registration', 'error', `Registration failed: ${result.message}`, result)
      }
    } catch (error) {
      updateTest('Device Registration', 'error', `Device registration failed: ${error}`)
    }

    // Test 6: Push Subscription (if permission granted)
    if (Notification.permission === 'granted') {
      updateTest('Push Subscription', 'pending', 'Testing push subscription...')
      try {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BLQK6JX65-Jkc1ubvAvRBs7FFGfuV1aVk3NlihqFM7mtdlrrnDhgK9IhNKFDCCk9okl-y8DXkoxddsS8sBjdFy0'
        })
        
        const deviceId = localStorage.getItem('device-id')
        const response = await fetch('/api/devices/push-subscription', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-device-id': deviceId || 'test-device'
          },
          body: JSON.stringify({ pushSubscription: subscription })
        })
        
        if (response.ok) {
          updateTest('Push Subscription', 'success', 'Push subscription registered', {
            endpoint: subscription.endpoint.substring(0, 50) + '...',
            hasKeys: !!(subscription.getKey('p256dh') && subscription.getKey('auth'))
          })
        } else {
          const error = await response.json()
          updateTest('Push Subscription', 'error', `Subscription failed: ${error.message}`)
        }
      } catch (error) {
        updateTest('Push Subscription', 'error', `Push subscription failed: ${error}`)
      }
    } else {
      updateTest('Push Subscription', 'error', 'Skipped - notification permission not granted')
    }

    // Test 7: Test Notification Endpoints
    const notificationTypes = ['morning', 'evening', 'missed_day', 'milestone', 'streak']
    
    for (const type of notificationTypes) {
      updateTest(`Test ${type}`, 'pending', `Testing ${type} notification...`)
      try {
        const response = await fetch('/api/notifications/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type })
        })
        
        const result = await response.json()
        if (response.ok) {
          updateTest(`Test ${type}`, 'success', 
            `Sent to ${result.sent} devices, ${result.failed} failed`, result)
        } else {
          updateTest(`Test ${type}`, 'error', `Test failed: ${result.message}`)
        }
      } catch (error) {
        updateTest(`Test ${type}`, 'error', `Test ${type} failed: ${error}`)
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    setIsRunning(false)
  }

  const getStatusIcon = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'pending':
        return <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
    }
  }

  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission()
      updateTest('Permission Request', permission === 'granted' ? 'success' : 'error', 
        `Permission ${permission}`)
    } catch (error) {
      updateTest('Permission Request', 'error', `Permission request failed: ${error}`)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-6 h-6 text-blue-500" />
            Notification System Test Suite
          </CardTitle>
          <CardDescription>
            Comprehensive test of all notification functionality including device registration, 
            push notifications, and real notification delivery.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button 
              onClick={runComprehensiveTest} 
              disabled={isRunning}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {isRunning ? 'Running Tests...' : 'Run Full Test Suite'}
            </Button>
            
            {Notification.permission !== 'granted' && (
              <Button 
                onClick={requestPermission}
                variant="outline"
                className="border-orange-300 text-orange-600 hover:bg-orange-50"
              >
                <Bell className="w-4 h-4 mr-2" />
                Enable Notifications
              </Button>
            )}
          </div>

          {testResults.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Test Results:</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border"
                  >
                    {getStatusIcon(result.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{result.test}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          result.status === 'success' ? 'bg-green-100 text-green-700' :
                          result.status === 'error' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {result.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{result.message}</p>
                      {result.details && (
                        <details className="mt-2">
                          <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700">
                            Show details
                          </summary>
                          <pre className="text-xs bg-slate-100 p-2 rounded mt-1 overflow-x-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">What This Test Checks:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Browser support for notifications, service workers, and push messaging</li>
              <li>• Notification permission status and request capability</li>
              <li>• Service worker registration and activation</li>
              <li>• VAPID key configuration for push notifications</li>
              <li>• Device registration with the backend system</li>
              <li>• Push subscription creation and registration</li>
              <li>• All 5 notification types (morning, evening, missed day, milestone, streak)</li>
              <li>• Real notification delivery to registered devices</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}