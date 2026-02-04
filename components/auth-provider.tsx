"use client"

import { useSessionManager } from "@/lib/session-manager"
import { GlobalStateProvider } from "@/lib/global-state"
import { useEffect } from "react"
import { RequestInterceptor } from "@/lib/request-interceptor"

function SessionManagerWrapper({ children }: { children: React.ReactNode }) {
  useSessionManager()
  
  useEffect(() => {
    // Request interceptor is a simple component, no initialization needed
    console.log('Auth provider initialized');
    
    return () => {
      // Cleanup on unmount
    }
  }, [])
  
  return children
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