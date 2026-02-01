"use client"

import { useSessionManager } from "@/lib/session-manager"
import { GlobalStateProvider } from "@/lib/global-state"
import { useEffect } from "react"
import NotificationService from "@/lib/notifications/advanced-notification-service"

function SessionManagerWrapper({ children }: { children: React.ReactNode }) {
  useSessionManager()
  
  useEffect(() => {
    // Initialize advanced notification system
    NotificationService.initialize()
    
    return () => {
      // Cleanup on unmount
      NotificationService.cleanup()
    }
  }, [])
  
  return <>{children}</>
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