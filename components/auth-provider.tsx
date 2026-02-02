"use client"

import { useSessionManager } from "@/lib/session-manager"
import { GlobalStateProvider } from "@/lib/global-state"
import { useEffect, useState } from "react"
import NotificationService from "@/lib/notifications/advanced-notification-service"
import { DeviceManager } from "@/lib/device-manager"
import DeviceSelectionModal from "./device-selection-modal"
import { RequestInterceptor } from "@/lib/request-interceptor"

function SessionManagerWrapper({ children }: { children: React.ReactNode }) {
  useSessionManager()
  const [showDeviceModal, setShowDeviceModal] = useState(false)
  const [deviceModalData, setDeviceModalData] = useState<any>(null)
  
  useEffect(() => {
    // Initialize request interceptor for device removal detection
    RequestInterceptor.initialize();
    
    // Initialize advanced notification system
    NotificationService.initialize()
    
    // Register device and handle device limit with STRICT validation
    const initializeDevice = async () => {
      try {
        // Check if user is logged in first
        const userCheck = await fetch('/api/user')
        if (!userCheck.ok) {
          return // Not logged in, skip device registration
        }
        
        console.log('User is logged in, validating device access...')
        
        // STEP 1: Validate current device status
        const deviceId = DeviceManager.getDeviceId()
        const validationResponse = await fetch('/api/devices/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceId })
        })
        
        if (validationResponse.ok) {
          const validation = await validationResponse.json()
          console.log('Device validation result:', validation)
          
          // If device is already registered and active, we're good
          if (validation.canAccess) {
            console.log('Device already registered and active')
            document.cookie = `device-id=${deviceId}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
            return
          }
          
          // If at device limit, show device selection modal
          if (validation.needsDeviceSelection) {
            console.log('Device limit reached, showing selection modal')
            setDeviceModalData({ existingDevices: validation.activeDevices })
            setShowDeviceModal(true)
            return
          }
        }
        
        // STEP 2: Try to register this device (only if under limit)
        console.log('Attempting device registration...')
        
        // Request notification permission
        let permission = Notification.permission
        if (permission === 'default') {
          permission = await Notification.requestPermission()
        }
        
        let pushSubscription = null
        if (permission === 'granted' && 'serviceWorker' in navigator) {
          try {
            const registration = await navigator.serviceWorker.register('/sw.js')
            await navigator.serviceWorker.ready
            pushSubscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
            })
          } catch (swError) {
            console.error('Service worker registration failed:', swError)
          }
        }
        
        const result = await DeviceManager.registerDevice(pushSubscription || undefined)
        console.log('Device registration result:', result)
        
        if (result.success) {
          console.log('Device registered successfully with ID:', result.deviceId)
          document.cookie = `device-id=${result.deviceId}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
        } else if (result.message === 'Device limit reached') {
          // Show device selection modal
          console.log('Registration failed - device limit reached')
          const retryResponse = await fetch('/api/devices/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deviceId })
          })
          
          if (retryResponse.ok) {
            const validation = await retryResponse.json()
            setDeviceModalData({ existingDevices: validation.activeDevices })
            setShowDeviceModal(true)
          }
        } else {
          console.error('Device registration failed:', result.message)
        }
        
      } catch (error) {
        console.error('Device initialization failed:', error)
      }
    }
    
    initializeDevice()
    
    return () => {
      // Cleanup on unmount
      NotificationService.cleanup()
      RequestInterceptor.cleanup()
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
        
        // Now register current device with force flag
        const deviceId = DeviceManager.getDeviceId()
        const deviceInfo = DeviceManager.getDeviceInfo()
        
        const registerResponse = await fetch('/api/devices/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...deviceInfo,
            deviceId,
            forceRegister: true // Force registration after removal
          })
        })
        
        if (registerResponse.ok) {
          const result = await registerResponse.json()
          if (result.success) {
            console.log('Device registered after removal:', result.deviceId)
            document.cookie = `device-id=${result.deviceId}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
            window.location.reload() // Refresh to complete login
          }
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