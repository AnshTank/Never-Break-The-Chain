'use client'

import { getDeviceId } from './device-id'

interface DeviceInfo {
  deviceName: string
  deviceType: 'mobile' | 'tablet' | 'desktop'
  browser: string
  os: string
}

export const getDeviceInfo = (): DeviceInfo => {
  if (typeof window === 'undefined') {
    return {
      deviceName: 'Unknown Device',
      deviceType: 'desktop',
      browser: 'Unknown',
      os: 'Unknown'
    }
  }

  const userAgent = navigator.userAgent
  
  // Detect device type
  let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop'
  if (/Mobile|Android|iPhone|iPod/.test(userAgent)) {
    deviceType = 'mobile'
  } else if (/iPad|Tablet/.test(userAgent)) {
    deviceType = 'tablet'
  }

  // Detect browser
  let browser = 'Unknown'
  if (userAgent.includes('Chrome')) browser = 'Chrome'
  else if (userAgent.includes('Firefox')) browser = 'Firefox'
  else if (userAgent.includes('Safari')) browser = 'Safari'
  else if (userAgent.includes('Edge')) browser = 'Edge'

  // Detect OS
  let os = 'Unknown'
  if (userAgent.includes('Windows')) os = 'Windows'
  else if (userAgent.includes('Mac')) os = 'macOS'
  else if (userAgent.includes('Linux')) os = 'Linux'
  else if (userAgent.includes('Android')) os = 'Android'
  else if (userAgent.includes('iOS')) os = 'iOS'

  const deviceName = `${browser} on ${os}`

  return { deviceName, deviceType, browser, os }
}

export const registerDeviceWithPushNotifications = async (rememberMe: boolean = false): Promise<boolean> => {
  try {
    const deviceId = getDeviceId()
    const deviceInfo = getDeviceInfo()
    
    console.log('Registering device:', { deviceId, ...deviceInfo })

    // Register the device with new session manager
    const registerResponse = await fetch('/api/devices/register', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-device-id': deviceId
      },
      body: JSON.stringify({
        deviceId,
        deviceName: deviceInfo.deviceName,
        deviceType: deviceInfo.deviceType,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        rememberMe
      })
    })

    const result = await registerResponse.json()
    
    if (!registerResponse.ok) {
      if (result.requiresDeviceSelection) {
        // Handle device limit reached - show device selection modal
        console.log('Device limit reached, showing selection modal')
        // This should be handled by the calling component
        throw new Error('DEVICE_LIMIT_REACHED')
      }
      console.error('Device registration failed:', result)
      return false
    }

    console.log('✅ Device registered successfully')

    // Setup push notifications if supported and user granted permission
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        // Check if permission is already granted
        if (Notification.permission === 'granted') {
          await setupPushSubscription(deviceId)
        } else if (Notification.permission === 'default') {
          // Request permission
          const permission = await Notification.requestPermission()
          if (permission === 'granted') {
            await setupPushSubscription(deviceId)
          }
        }
      } catch (pushError) {
        console.warn('⚠️ Push notification setup failed:', pushError)
      }
    }

    return true
  } catch (error) {
    if (error instanceof Error && error.message === 'DEVICE_LIMIT_REACHED') {
      throw error // Re-throw to be handled by calling component
    }
    console.error('❌ Device registration failed:', error)
    return false
  }
}

const setupPushSubscription = async (deviceId: string): Promise<void> => {
  const registration = await navigator.serviceWorker.register('/sw.js')
  await navigator.serviceWorker.ready

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BLQK6JX65-Jkc1ubvAvRBs7FFGfuV1aVk3NlihqFM7mtdlrrnDhgK9IhNKFDCCk9okl-y8DXkoxddsS8sBjdFy0'
  })

  await fetch('/api/devices/push-subscription', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'x-device-id': deviceId
    },
    body: JSON.stringify({ pushSubscription: subscription })
  })

  console.log('✅ Push notifications registered')
}

export const updateDevicePushSubscription = async (): Promise<boolean> => {
  try {
    if ('serviceWorker' in navigator && 'PushManager' in window && Notification.permission === 'granted') {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BLQK6JX65-Jkc1ubvAvRBs7FFGfuV1aVk3NlihqFM7mtdlrrnDhgK9IhNKFDCCk9okl-y8DXkoxddsS8sBjdFy0'
      })

      const deviceId = getDeviceId()
      const response = await fetch('/api/devices/push-subscription', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-device-id': deviceId
        },
        body: JSON.stringify({ pushSubscription: subscription })
      })

      return response.ok
    }
    return false
  } catch (error) {
    console.error('Failed to update push subscription:', error)
    return false
  }
}