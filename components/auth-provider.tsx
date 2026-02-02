"use client"

import { useSessionManager } from "@/lib/session-manager"
import { GlobalStateProvider } from "@/lib/global-state"
import { useEffect, useState } from "react"
import NotificationService from "@/lib/notifications/advanced-notification-service"
import { DeviceManager } from "@/lib/device-manager"
import DeviceSelectionModal from "./device-selection-modal"

function SessionManagerWrapper({ children }: { children: React.ReactNode }) {
  useSessionManager()
  const [showDeviceModal, setShowDeviceModal] = useState(false)
  const [deviceModalData, setDeviceModalData] = useState<any>(null)
  
  useEffect(() => {
    // Initialize advanced notification system
    NotificationService.initialize()
    
    // Register device and handle device limit
    const initializeDevice = async () => {
      try {
        // Check if user is logged in first
        const userCheck = await fetch('/api/user')
        if (!userCheck.ok) {
          return // Not logged in, skip device registration
        }
        
        console.log('User is logged in, initializing device...')
        
        // Request notification permission
        let permission = Notification.permission
        if (permission === 'default') {
          permission = await Notification.requestPermission()
        }
        
        console.log('Notification permission:', permission)
        
        let pushSubscription = null
        
        if (permission === 'granted' && 'serviceWorker' in navigator) {
          try {
            // Register service worker
            const registration = await navigator.serviceWorker.register('/sw.js')
            await navigator.serviceWorker.ready
            
            // Subscribe to push notifications
            pushSubscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
            })
            
            console.log('Push subscription created:', !!pushSubscription)
          } catch (swError) {
            console.error('Service worker registration failed:', swError)
          }
        }
        
        const result = await DeviceManager.registerDevice(pushSubscription || undefined)
        console.log('Device registration result:', result)
        
        if (!result.success && result.message === 'Device limit reached') {
          // Show device selection modal
          const response = await fetch('/api/devices/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...DeviceManager.getDeviceInfo(),
              deviceId: DeviceManager.getStoredDeviceId() || DeviceManager.generateAndStoreDeviceId(),
              pushSubscription
            })
          })
          
          if (response.status === 409) {
            const data = await response.json()
            setDeviceModalData(data)
            setShowDeviceModal(true)
          }
        }
        
        // Optimized heartbeat - only every 10 minutes and throttled
        let lastHeartbeat = 0
        const heartbeatInterval = setInterval(() => {
          const now = Date.now()
          if (now - lastHeartbeat > 10 * 60 * 1000) { // 10 minutes minimum
            lastHeartbeat = now
            DeviceManager.updateLastActive()
          }
        }, 10 * 60 * 1000) // Check every 10 minutes
        
        return () => clearInterval(heartbeatInterval)
      } catch (error) {
        console.error('Device initialization failed:', error)
      }
    }
    
    initializeDevice()
    
    return () => {
      // Cleanup on unmount
      NotificationService.cleanup()
    }
  }, [])
  
  const handleDeviceRemove = async (deviceIdToRemove: string) => {
    try {
      const response = await fetch('/api/devices/register', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceIdToRemove })
      })
      
      if (response.ok) {
        setShowDeviceModal(false)
        // Retry device registration
        const result = await DeviceManager.registerDevice()
        if (result.success) {
          window.location.reload() // Refresh to complete login
        }
      }
    } catch (error) {
      console.error('Failed to remove device:', error)
    }
  }
  
  return (
    <>
      {children}
      <DeviceSelectionModal
        isOpen={showDeviceModal}
        devices={deviceModalData?.existingDevices || []}
        onDeviceRemove={handleDeviceRemove}
        onCancel={() => setShowDeviceModal(false)}
      />
    </>
  )
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <GlobalStateProvider>
      <SessionManagerWrapper>
        {children}
      </SessionManagerWrapper>
    </GlobalStateProvider>
  )
}