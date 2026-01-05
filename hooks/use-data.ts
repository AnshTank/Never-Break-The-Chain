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
  const cacheRef = useRef<Record<string, any>>({})

  const fetchProgress = useCallback(async () => {
    if (fetchedRef.current === date || !isMountedRef.current) return
    
    // Check cache first
    if (cacheRef.current[date]) {
      if (isMountedRef.current) {
        setProgress(cacheRef.current[date])
        setLoading(false)
      }
      return
    }
    
    try {
      setLoading(true)
      fetchedRef.current = date
      const response = await fetch(`/api/progress?date=${date}`, {
        method: 'GET',
        cache: 'force-cache',
        next: { revalidate: 60 }
      })
      if (!response.ok) {
        const authResponse = await fetch('/api/user/profile')
        if (!authResponse.ok) {
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
        cacheRef.current[date] = data
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
      const response = await fetch('/api/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, updates })
      })
      
      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Failed to update progress: ${response.status}`)
      }
      
      const responseData = await response.json()
      
      // Update cache and state
      const updatedProgress = { ...progress, ...updates }
      cacheRef.current[date] = updatedProgress
      setProgress(updatedProgress)
      
      // Emit real-time update events
      mnzdEvents.emitProgressUpdate(date, updatedProgress)
      window.dispatchEvent(new CustomEvent('progressUpdated', { detail: { date } }))
    } catch (err) {
      console.error('Error updating progress:', err)
      throw err
    }
  }, [date, progress])

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