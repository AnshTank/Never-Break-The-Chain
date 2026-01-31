"use client"

import { useEffect, useRef } from "react"
import { logout } from "@/lib/auth-utils"
import { clearAllCaches } from "@/lib/cache-utils"

export function useSessionManager() {
  const lastActivityRef = useRef<number>(Date.now())
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const rememberMeRef = useRef<boolean>(false)
  const isAuthenticatedRef = useRef<boolean>(false)

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user/profile')
        const wasAuthenticated = isAuthenticatedRef.current
        isAuthenticatedRef.current = response.ok
        
        if (!response.ok) {
          // User not authenticated, clear all caches
          if (wasAuthenticated) {
            clearAllCaches()
          }
          return
        }
      } catch (error) {
        isAuthenticatedRef.current = false
        return
      }

      // Check remember me preference
      const rememberMe = localStorage.getItem('rememberMe') === 'true'
      rememberMeRef.current = rememberMe
      
      // If remember me is enabled, extend session to 3 days
      if (rememberMe) {
        // Set a longer timeout for remember me sessions (3 days)
        const extendedTimeout = setTimeout(() => {
          logout()
        }, 3 * 24 * 60 * 60 * 1000) // 3 days
        
        return () => clearTimeout(extendedTimeout)
      }
      
      // For non-remember-me sessions, implement activity monitoring
      const updateActivity = () => {
        lastActivityRef.current = Date.now()
      }

      const checkInactivity = () => {
        const now = Date.now()
        const timeSinceLastActivity = now - lastActivityRef.current
        
        // If inactive for 30 minutes, sign out
        if (timeSinceLastActivity > 30 * 60 * 1000) {
          logout()
          return
        }
        
        // Check again in 1 minute
        timeoutRef.current = setTimeout(checkInactivity, 60 * 1000)
      }

      // Activity event listeners
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
      events.forEach(event => {
        document.addEventListener(event, updateActivity, true)
      })

      // Start inactivity checker
      timeoutRef.current = setTimeout(checkInactivity, 60 * 1000)

      // Handle page visibility change (browser tab switch, minimize, etc.)
      const handleVisibilityChange = () => {
        if (document.hidden) {
          // Page is hidden, start a timer for potential logout
          const hiddenTimeout = setTimeout(() => {
            if (document.hidden && !rememberMeRef.current) {
              logout()
            }
          }, 5 * 60 * 1000) // 5 minutes grace period
          
          // Store timeout ID to clear it if page becomes visible again
          ;(window as any).__hiddenTimeout = hiddenTimeout
        } else {
          // Page is visible again, clear the hidden timeout and update activity
          if ((window as any).__hiddenTimeout) {
            clearTimeout((window as any).__hiddenTimeout)
            delete (window as any).__hiddenTimeout
          }
          updateActivity()
        }
      }

      // Handle beforeunload (browser/tab closing)
      const handleBeforeUnload = () => {
        if (!rememberMeRef.current) {
          // For non-remember-me sessions, clear the session when browser closes
          navigator.sendBeacon('/api/auth/cleanup')
        }
      }

      document.addEventListener('visibilitychange', handleVisibilityChange)
      window.addEventListener('beforeunload', handleBeforeUnload)

      // Cleanup
      return () => {
        events.forEach(event => {
          document.removeEventListener(event, updateActivity, true)
        })
        document.removeEventListener('visibilitychange', handleVisibilityChange)
        window.removeEventListener('beforeunload', handleBeforeUnload)
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        if ((window as any).__hiddenTimeout) {
          clearTimeout((window as any).__hiddenTimeout)
          delete (window as any).__hiddenTimeout
        }
      }
    }
    
    checkAuth()
  }, [])

  return { authenticated: isAuthenticatedRef.current }
}

// Utility to check if session should persist across browser restarts
export function shouldPersistSession(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('rememberMe') === 'true'
}

// Clear remember me preference
export function clearRememberMe() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('rememberMe')
  }
}