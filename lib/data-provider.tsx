import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { JourneyData } from '@/lib/types'

interface DataContextType {
  currentMonthData: JourneyData
  yearData: JourneyData
  loading: boolean
  refreshData: () => void
}

const DataContext = createContext<DataContextType | null>(null)

const transformData = (data: any[], mnzdConfigs: any[]) => {
  const result: JourneyData = {}
  data.forEach((dayProgress: any) => {
    result[dayProgress.date] = {
      date: dayProgress.date,
      tasks: dayProgress.tasks.map((task: any) => {
        const config = mnzdConfigs.find((c: any) => c.id === task.id)
        const minMinutes = config?.minMinutes || 0
        return {
          id: task.id,
          name: task.name || config?.name || task.id,
          completed: task.minutes >= minMinutes,
          minutes: task.minutes,
        }
      }),
      totalHours: dayProgress.totalHours || 0,
      note: dayProgress.note || '',
      completed: dayProgress.tasks.every((task: any) => {
        const config = mnzdConfigs.find((c: any) => c.id === task.id)
        return task.minutes >= (config?.minMinutes || 0)
      })
    }
  })
  return result
}

export function DataProvider({ children, initialData }: { children: ReactNode, initialData?: { monthData: any[], yearData: any[], settings?: any } }) {
  // Try to get data from localStorage first
  const getCachedData = () => {
    try {
      const cached = localStorage.getItem('dashboardData')
      if (cached) {
        const data = JSON.parse(cached)
        return {
          monthData: data.monthData || [],
          yearData: data.yearData || [],
          settings: data.settings
        }
      }
    } catch {}
    return initialData
  }
  
  const dataToUse = getCachedData() || initialData
  
  // Initialize with transformed data immediately if available
  const getInitialData = () => {
    if (!dataToUse) return { currentMonthData: {}, yearData: {} }
    
    const mnzdConfigs = dataToUse.settings?.mnzdConfigs || []
    return {
      currentMonthData: transformData(dataToUse.monthData || [], mnzdConfigs),
      yearData: transformData(dataToUse.yearData || [], mnzdConfigs)
    }
  }
  
  const initial = getInitialData()
  const [currentMonthData, setCurrentMonthData] = useState<JourneyData>(initial.currentMonthData)
  const [yearData, setYearData] = useState<JourneyData>(initial.yearData)
  const [loading, setLoading] = useState(!dataToUse)

  const fetchAllData = async () => {
    if (dataToUse) return // Skip if we have data
    
    try {
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1
      
      // Load from cache immediately
      const cachedData = localStorage.getItem('progressCache')
      if (cachedData) {
        try {
          const cache = JSON.parse(cachedData)
          setCurrentMonthData(cache)
          setYearData(cache)
        } catch {}
      }
      
      setLoading(true)
      
      // Fetch current month and full year data in parallel
      const [monthResponse, yearResponse, settingsResponse] = await Promise.all([
        fetch(`/api/progress-range?startDate=${year}-${String(month).padStart(2, '0')}-01&endDate=${year}-${String(month).padStart(2, '0')}-31`),
        fetch(`/api/progress-range?startDate=${year}-01-01&endDate=${year}-12-31`),
        fetch('/api/settings')
      ])

      const [monthData, fullYearData, settings] = await Promise.all([
        monthResponse.ok ? monthResponse.json() : [],
        yearResponse.ok ? yearResponse.json() : [],
        settingsResponse.ok ? settingsResponse.json() : { mnzdConfigs: [] }
      ])

      const mnzdConfigs = settings.mnzdConfigs || []
      const transformedMonthData = transformData(monthData, mnzdConfigs)
      const transformedYearData = transformData(fullYearData, mnzdConfigs)
      
      setCurrentMonthData(transformedMonthData)
      setYearData(transformedYearData)
      
      // Update cache
      localStorage.setItem('progressCache', JSON.stringify(transformedYearData))
    } catch (error) {
      // Keep existing data on error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!dataToUse) {
      // Load cached data immediately on mount
      const cachedData = localStorage.getItem('progressCache')
      if (cachedData) {
        try {
          const cache = JSON.parse(cachedData)
          setCurrentMonthData(cache)
          setYearData(cache)
        } catch {}
      }
      
      // Then fetch fresh data
      fetchAllData()
    }
  }, [dataToUse])

  return (
    <DataContext.Provider value={{
      currentMonthData,
      yearData,
      loading,
      refreshData: fetchAllData
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useSharedData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useSharedData must be used within DataProvider')
  }
  return context
}