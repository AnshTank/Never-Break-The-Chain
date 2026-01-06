import { useState, useEffect } from 'react'
import type { JourneyData, DayEntry } from '@/lib/types'
import type { MNZDConfig } from '@/lib/models-new'

export function useProgressData(month?: Date) {
  const [data, setData] = useState<JourneyData>({})
  const [loading, setLoading] = useState(true)

  const fetchProgressData = async (targetMonth?: Date) => {
    try {
      setLoading(true)
      
      const currentMonth = targetMonth || new Date()
      const year = currentMonth.getFullYear()
      const monthNum = currentMonth.getMonth() + 1
      
      // Get start and end dates for the month
      const startDate = `${year}-${String(monthNum).padStart(2, '0')}-01`
      const lastDay = new Date(year, monthNum, 0).getDate()
      const endDate = `${year}-${String(monthNum).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
      
      // Fetch both progress data and user settings
      const [progressResponse, settingsResponse] = await Promise.all([
        fetch(`/api/progress-range?startDate=${startDate}&endDate=${endDate}`),
        fetch('/api/settings')
      ])
      
      // Handle individual response errors gracefully
      let progressData = []
      let mnzdConfigs: MNZDConfig[] = []
      
      if (progressResponse.ok) {
        progressData = await progressResponse.json()
      } else {
        console.warn('Failed to fetch progress data:', progressResponse.status)
      }
      
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json()
        mnzdConfigs = settingsData.mnzdConfigs || []
      } else {
        console.warn('Failed to fetch settings:', settingsResponse.status)
      }
      
      console.log('useProgressData - Raw progress data:', progressData)
      console.log('useProgressData - MNZD configs:', mnzdConfigs)
      
      // Transform database data to JourneyData format
      const journeyData: JourneyData = {}
      
      progressData.forEach((dayProgress: any) => {
        console.log('Processing day progress:', dayProgress)
        
        const dayEntry: DayEntry = {
          date: dayProgress.date,
          tasks: dayProgress.tasks.map((task: any) => {
            const config = mnzdConfigs.find(c => c.id === task.id)
            const minMinutes = config?.minMinutes || 0
            console.log(`Task ${task.id}: ${task.minutes} minutes, minRequired: ${minMinutes}, completed: ${task.minutes >= minMinutes}`)
            return {
              id: task.id,
              name: task.name || config?.name || task.id,
              completed: task.minutes >= minMinutes,
              minutes: task.minutes,
            }
          }),
          totalHours: dayProgress.totalHours || 0,
          note: dayProgress.note || '',
          completed: false // Will be calculated below
        }
        
        // Calculate if day is completed (all tasks meet minimum requirements)
        dayEntry.completed = dayEntry.tasks.every(task => task.completed)
        
        console.log('Final day entry:', dayEntry)
        journeyData[dayProgress.date] = dayEntry
      })
      
      console.log('useProgressData - Transformed journey data:', journeyData)
      setData(journeyData)
    } catch (error) {
      console.error('Error fetching progress data:', error)
      setData({})
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProgressData(month)
  }, [month?.getFullYear(), month?.getMonth()])

  return {
    data,
    loading,
    refetch: fetchProgressData
  }
}