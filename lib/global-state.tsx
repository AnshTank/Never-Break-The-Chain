"use client"

import { createContext, useContext, useEffect, useState, useRef, ReactNode, useCallback } from 'react'
import { MNZDConfig } from '@/lib/models-new'
import { mnzdEvents } from '@/lib/mnzd-events'

interface GlobalState {
  settings: { mnzdConfigs: MNZDConfig[] } | null
  settingsLoading: boolean
  analytics: {
    currentStreak: number
    longestStreak: number
    totalDays: number
    totalHours: number
  } | null
  analyticsLoading: boolean
  isNewUser: boolean | null
  userLoading: boolean
  dailyProgressCache: Record<string, any>
  todayProgress: any
  todayLoading: boolean
}

interface GlobalStateContextType extends GlobalState {
  updateSettings: (updates: { mnzdConfigs?: MNZDConfig[]; theme?: 'light' | 'dark' | 'system' }) => Promise<void>
  updateUserStatus: (newStatus: boolean) => Promise<void>
  refetchSettings: () => Promise<void>
  refetchAnalytics: (month?: Date) => Promise<void>
  refetchUser: () => Promise<void>
  loadProgressForDate: (date: string) => Promise<any>
  updateProgressForDate: (date: string, updates: any) => Promise<void>
  getTodayProgress: () => any
  updateTodayProgressImmediate: (newData: any) => void
  clearAllCache: () => void
}

const GlobalStateContext = createContext<GlobalStateContextType | null>(null)

export function GlobalStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GlobalState>({
    settings: null,
    settingsLoading: true,
    analytics: null,
    analyticsLoading: true,
    isNewUser: null,
    userLoading: true,
    dailyProgressCache: {},
    todayProgress: null,
    todayLoading: true,
  })

  const fetchedRef = useRef<{
    settings: boolean
    analytics: string | null
    user: boolean
  }>({
    settings: false,
    analytics: null,
    user: false,
  })

  const fetchSettings = async () => {
    if (fetchedRef.current.settings) return
    try {
      setState(prev => ({ ...prev, settingsLoading: true }))
      fetchedRef.current.settings = true
      const response = await fetch('/api/settings', {
        method: 'GET',
        cache: 'force-cache',
        next: { revalidate: 300 } // Cache for 5 minutes
      })
      if (!response.ok) {
        if (response.status === 401) {
          setState(prev => ({ ...prev, settingsLoading: false }))
          return
        }
        throw new Error('Failed to fetch settings')
      }
      const data = await response.json()
      setState(prev => ({ ...prev, settings: data, settingsLoading: false }))
    } catch (err) {
      // console.error('Error fetching settings:', err)
      fetchedRef.current.settings = false
      setState(prev => ({ ...prev, settingsLoading: false }))
    }
  }

  const fetchAnalytics = async (month?: Date) => {
    const monthKey = month ? month.toISOString().split('T')[0].substring(0, 7) : 'current'
    
    try {
      setState(prev => ({ ...prev, analyticsLoading: true }))
      fetchedRef.current.analytics = monthKey
      
      const url = month ? `/api/analytics?month=${month.toISOString()}` : '/api/analytics'
      const response = await fetch(url, {
        method: 'GET',
        cache: 'no-cache', // Force fresh data
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      if (!response.ok) {
        if (response.status === 401) {
          setState(prev => ({ ...prev, analyticsLoading: false }))
          return
        }
        throw new Error('Failed to fetch analytics')
      }
      const data = await response.json()
      setState(prev => ({ ...prev, analytics: data, analyticsLoading: false }))
    } catch (err) {
      // console.error('Error fetching analytics:', err)
      fetchedRef.current.analytics = null
      setState(prev => ({ ...prev, analyticsLoading: false }))
    }
  }

  const fetchUser = async () => {
    if (fetchedRef.current.user) return
    try {
      setState(prev => ({ ...prev, userLoading: true }))
      fetchedRef.current.user = true
      const response = await fetch('/api/user')
      if (!response.ok) {
        if (response.status === 401) {
          setState(prev => ({ ...prev, isNewUser: null, userLoading: false }))
          return
        }
        throw new Error('Failed to fetch user status')
      }
      const data = await response.json()
      setState(prev => ({ ...prev, isNewUser: data.isNewUser, userLoading: false }))
    } catch (err) {
      // console.error('Error fetching user status:', err)
      fetchedRef.current.user = false
      setState(prev => ({ ...prev, isNewUser: null, userLoading: false }))
    }
  }

  const updateSettings = async (updates: { mnzdConfigs?: MNZDConfig[]; theme?: 'light' | 'dark' | 'system' }) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (!response.ok) throw new Error('Failed to update settings')
      
      const newSettings = { ...state.settings, ...updates }
      setState(prev => ({ ...prev, settings: newSettings as any }))
      
      // Emit real-time update event
      mnzdEvents.emitSettingsUpdate(newSettings)
    } catch (err) {
      // console.error('Error updating settings:', err)
    }
  }

  const updateUserStatus = async (newStatus: boolean) => {
    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isNewUser: newStatus })
      })
      if (!response.ok) throw new Error('Failed to update user status')
      setState(prev => ({ ...prev, isNewUser: newStatus }))
    } catch (err) {
      // console.error('Error updating user status:', err)
    }
  }

  const refetchSettings = async () => {
    fetchedRef.current.settings = false
    await fetchSettings()
  }

  const refetchAnalytics = useCallback(async (month?: Date) => {
    // Clear cache and force fresh fetch
    fetchedRef.current.analytics = null
    setState(prev => ({ ...prev, analytics: null, analyticsLoading: true }))
    await fetchAnalytics(month)
  }, [])

  const refetchUser = async () => {
    fetchedRef.current.user = false
    await fetchUser()
  }

  const loadProgressForDate = async (date: string) => {
    if (state.dailyProgressCache[date]) {
      return state.dailyProgressCache[date]
    }
    
    try {
      const response = await fetch(`/api/progress?date=${date}`)
      
      if (!response.ok) {
        return null
      }
      
      const data = await response.json()
      
      setState(prev => ({
        ...prev,
        dailyProgressCache: {
          ...prev.dailyProgressCache,
          [date]: data
        }
      }))
      
      return data
    } catch (err) {
      // console.error('Error loading progress:', err)
      return null
    }
  }

  const updateProgressForDate = async (date: string, updates: any) => {
    try {
      const response = await fetch('/api/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, updates })
      })
      
      if (!response.ok) {
        return
      }
      
      // Update cache
      setState(prev => {
        const currentData = prev.dailyProgressCache[date] || {}
        const updatedData = { ...currentData, ...updates }
        
        return {
          ...prev,
          dailyProgressCache: {
            ...prev.dailyProgressCache,
            [date]: updatedData
          },
          // Update today's progress if it's today
          todayProgress: (() => {
            const today = new Date()
            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
            return date === todayStr ? updatedData : prev.todayProgress
          })()
        }
      })
      
      // Emit real-time update events
      const updatedData = { ...state.dailyProgressCache[date], ...updates }
      mnzdEvents.emitProgressUpdate(date, updatedData)
    } catch (err) {
      // console.error('Error updating progress:', err)
      throw err
    }
  }

  const updateTodayProgressImmediate = (newData: any) => {
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    
    setState(prev => ({
      ...prev,
      todayProgress: newData,
      todayLoading: false,
      dailyProgressCache: {
        ...prev.dailyProgressCache,
        [todayStr]: newData
      }
    }))
  }

  const getTodayProgress = () => {
    return state.todayProgress
  }

  const clearAllCache = () => {
    setState({
      settings: null,
      settingsLoading: false,
      analytics: null,
      analyticsLoading: false,
      isNewUser: null,
      userLoading: false,
      dailyProgressCache: {},
      todayProgress: null,
      todayLoading: false,
    })
    fetchedRef.current = {
      settings: false,
      analytics: null,
      user: false,
    }
  }

  useEffect(() => {
    let mounted = true
    
    // Initialize global state on mount with debouncing
    const timer = setTimeout(async () => {
      if (!mounted) return
      
      try {
        // Parallel loading for better performance
        const [userResult, settingsResult, analyticsResult] = await Promise.allSettled([
          fetchUser(),
          fetchSettings(),
          fetchAnalytics()
        ])
        
        if (!mounted) return
        
        // Load today's progress only if user is authenticated
        if (userResult.status === 'fulfilled') {
          const today = new Date()
          const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
          
          setState(prev => ({ ...prev, todayLoading: true }))
          
          try {
            const data = await loadProgressForDate(todayStr)
            if (mounted) {
              setState(prev => ({
                ...prev,
                todayProgress: data,
                todayLoading: false
              }))
            }
          } catch (progressError) {
            // console.error('Error loading today progress:', progressError)
            if (mounted) {
              setState(prev => ({
                ...prev,
                todayProgress: null,
                todayLoading: false
              }))
            }
          }
        } else {
          if (mounted) {
            setState(prev => ({
              ...prev,
              todayLoading: false
            }))
          }
        }
      } catch (error) {
        // console.error('Error initializing global state:', error)
        if (mounted) {
          setState(prev => ({
            ...prev,
            settingsLoading: false,
            analyticsLoading: false,
            userLoading: false,
            todayLoading: false
          }))
        }
      }
    }, 50)
    
    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [])

  return (
    <GlobalStateContext.Provider value={{
      ...state,
      updateSettings,
      updateUserStatus,
      refetchSettings,
      refetchAnalytics,
      refetchUser,
      loadProgressForDate,
      updateProgressForDate,
      getTodayProgress,
      updateTodayProgressImmediate,
      clearAllCache,
    }}>
      {children}
    </GlobalStateContext.Provider>
  )
}

export function useGlobalState() {
  const context = useContext(GlobalStateContext)
  if (!context) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider')
  }
  return context
}

// Individual hooks for backward compatibility
export function useUserSettings() {
  const { settings, settingsLoading, updateSettings, refetchSettings } = useGlobalState()
  return { 
    settings, 
    loading: settingsLoading, 
    updateSettings, 
    refetch: refetchSettings 
  }
}

export function useAnalytics() {
  const { analytics, analyticsLoading, refetchAnalytics } = useGlobalState()
  
  const refetch = useCallback(async (month?: Date) => {
    return refetchAnalytics(month)
  }, [refetchAnalytics])
  
  return { 
    analytics, 
    loading: analyticsLoading, 
    refetch
  }
}

export function useUserStatus() {
  const { isNewUser, userLoading, updateUserStatus, refetchUser } = useGlobalState()
  return { 
    isNewUser, 
    loading: userLoading, 
    updateUserStatus, 
    refetch: refetchUser 
  }
}

export function useGlobalDailyProgress() {
  const { loadProgressForDate, updateProgressForDate, getTodayProgress, todayProgress, todayLoading, updateTodayProgressImmediate } = useGlobalState()
  return { 
    loadProgressForDate, 
    updateProgressForDate,
    getTodayProgress,
    todayProgress,
    todayLoading,
    updateTodayProgressImmediate
  }
}