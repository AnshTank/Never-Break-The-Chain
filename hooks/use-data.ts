import { useState, useEffect, useCallback, useRef } from 'react'
import { mnzdEvents } from '@/lib/mnzd-events'

// Export the global state hooks
export { useUserSettings, useAnalytics, useUserStatus, useGlobalDailyProgress } from '@/lib/global-state'

// Keep only the progress-related hooks here since they need to be per-component
export function useDailyProgress(date: string) {
  const [progress, setProgress] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const fetchedRef = useRef<string | null>(null)
  const isMountedRef = useRef(true)

  const fetchProgress = useCallback(async () => {
    if (fetchedRef.current === date || !isMountedRef.current) return
    try {
      setLoading(true)
      fetchedRef.current = date
      const response = await fetch(`/api/progress?date=${date}`)
      if (!response.ok) {
        // Check if user is authenticated
        const authResponse = await fetch('/api/user/profile')
        if (!authResponse.ok) {
          // User not authenticated, clear cache
          localStorage.removeItem('progressCache')
          if (isMountedRef.current) {
            setProgress(null)
          }
          return
        }
        throw new Error('Failed to fetch progress')
      }
      const data = await response.json()
      if (isMountedRef.current) {
        setProgress(data)
      }
    } catch (err) {
      console.error('Error fetching progress:', err)
      if (isMountedRef.current) {
        fetchedRef.current = null
        setProgress(null)
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [date])

  const updateProgress = useCallback(async (updates: any) => {
    try {
      console.log('updateProgress called with:', { date, updates })
      
      const response = await fetch('/api/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, updates })
      })
      
      console.log('updateProgress response:', { status: response.status, ok: response.ok })
      
      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Failed to update progress: ${response.status}`)
      }
      
      const responseData = await response.json()
      console.log('updateProgress success:', responseData)
      
      // Force refetch by clearing cache
      fetchedRef.current = null
      await fetchProgress()
      
      // Emit real-time update events
      const updatedProgress = { ...progress, ...updates }
      mnzdEvents.emitProgressUpdate(date, updatedProgress)
      
      // Trigger global refresh event for other components
      window.dispatchEvent(new CustomEvent('progressUpdated', { detail: { date } }))
    } catch (err) {
      console.error('Error updating progress:', err)
      throw err
    }
  }, [date, fetchProgress, progress])

  useEffect(() => {
    isMountedRef.current = true
    if (fetchedRef.current !== date) {
      fetchProgress()
    }
    
    return () => {
      isMountedRef.current = false
    }
  }, [fetchProgress, date])

  return { progress, loading, updateProgress, refetch: fetchProgress }
}

export function useProgressRange(startDate: string, endDate: string) {
  const [progressData, setProgressData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const fetchedRef = useRef<string | null>(null)
  const isMountedRef = useRef(true)

  const fetchProgressRange = useCallback(async () => {
    const cacheKey = `${startDate}-${endDate}`
    if (fetchedRef.current === cacheKey || !isMountedRef.current) return
    
    try {
      setLoading(true)
      fetchedRef.current = cacheKey
      
      // Always prioritize server data
      const response = await fetch(`/api/progress?startDate=${startDate}&endDate=${endDate}`)
      
      if (response.ok) {
        const serverData = await response.json()
        if (isMountedRef.current) {
          setProgressData(serverData)
        }
      } else {
        // Only use cache if server fails AND user is authenticated
        const authResponse = await fetch('/api/user/profile')
        if (!authResponse.ok) {
          // User not authenticated, clear cache and show empty
          localStorage.removeItem('progressCache')
          if (isMountedRef.current) {
            setProgressData([])
          }
        } else {
          // User authenticated but server failed, use cache as fallback
          const progressCache = JSON.parse(localStorage.getItem('progressCache') || '{}')
          const cachedData = Object.keys(progressCache)
            .filter(dateStr => dateStr >= startDate && dateStr <= endDate)
            .map(dateStr => ({ date: dateStr, ...progressCache[dateStr] }))
          
          if (isMountedRef.current) {
            setProgressData(cachedData)
          }
        }
      }
    } catch (err) {
      if (isMountedRef.current) {
        setProgressData([])
        fetchedRef.current = null
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [startDate, endDate])

  useEffect(() => {
    isMountedRef.current = true
    const cacheKey = `${startDate}-${endDate}`
    if (fetchedRef.current !== cacheKey) {
      fetchProgressRange()
    }
    
    return () => {
      isMountedRef.current = false
    }
  }, [fetchProgressRange, startDate, endDate])

  return { progressData, loading, refetch: fetchProgressRange }
}