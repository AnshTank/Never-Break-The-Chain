"use client"

import { useSessionManager } from "@/lib/session-manager"
import { GlobalStateProvider } from "@/lib/global-state"

function SessionManagerWrapper({ children }: { children: React.ReactNode }) {
  useSessionManager()
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