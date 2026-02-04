import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/jwt'
import { DatabaseService } from '@/lib/database'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    
    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const monthParam = searchParams.get('month')

    // Get user settings for minimum requirements
    const userSettings = await DatabaseService.getUserSettings(user.userId)
    const mnzdConfigs = userSettings?.mnzdConfigs || []

    // Get all data for streak calculation
    const allData = await DatabaseService.getProgressRange(
      user.userId, 
      '2020-01-01', 
      '2030-12-31'
    )

    // Get specific month's data
    let targetDate: Date
    if (monthParam) {
      targetDate = new Date(monthParam)
    } else {
      targetDate = new Date()
    }
    
    const year = targetDate.getFullYear()
    const month = targetDate.getMonth() + 1
    const startOfMonth = `${year}-${String(month).padStart(2, '0')}-01`
    const lastDay = new Date(year, month, 0).getDate()
    const endOfMonth = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
    
    const monthlyData = await DatabaseService.getProgressRange(
      user.userId, 
      startOfMonth, 
      endOfMonth
    )

    // Calculate metrics from database data
    const totalHours = monthlyData.reduce((sum, day) => sum + (day.totalHours || 0), 0)
    const totalDays = monthlyData.filter(day => (day.totalHours || 0) > 0).length
    
    // Calculate MNZD streaks - only count days where ALL 4 tasks are completed
    const completedDays = allData.filter(day => {
      if (!day.tasks || day.tasks.length < 4) return false
      
      // Check if all 4 MNZD tasks are marked as completed
      return day.tasks.every(task => task.completed === true)
    }).sort((a, b) => a.date.localeCompare(b.date))
    
    let currentStreak = 0
    let longestStreak = 0
    
    // Calculate current streak (including today if completed)
    // Use local date calculation to match frontend (assuming UTC+5:30 IST)
    const now = new Date()
    const localOffset = 5.5 * 60 * 60 * 1000 // IST offset in milliseconds
    const localTime = new Date(now.getTime() + localOffset)
    const today = `${localTime.getFullYear()}-${String(localTime.getMonth() + 1).padStart(2, '0')}-${String(localTime.getDate()).padStart(2, '0')}`
    let checkDate = new Date(today + 'T00:00:00')
    
    // Check if today is completed first
    const todayData = completedDays.find(d => d.date === today)
    
    if (todayData) {
      currentStreak = 1
      checkDate.setDate(checkDate.getDate() - 1) // Move to yesterday
      
      // Continue checking backwards
      while (true) {
        const dayStr = checkDate.toISOString().split('T')[0]
        const dayData = completedDays.find(d => d.date === dayStr)
        
        if (dayData) {
          currentStreak++
          checkDate.setDate(checkDate.getDate() - 1)
        } else {
          break
        }
      }
    } else {
      // Today not completed, check from yesterday
      checkDate.setDate(checkDate.getDate() - 1)
      
      while (true) {
        const dayStr = checkDate.toISOString().split('T')[0]
        const dayData = completedDays.find(d => d.date === dayStr)
        
        if (dayData) {
          currentStreak++
          checkDate.setDate(checkDate.getDate() - 1)
        } else {
          break
        }
      }
    }
    
    // Calculate longest streak correctly
    let tempStreak = 0
    let prevDateObj: Date | null = null
    
    for (const day of completedDays) {
      const currentDateObj = new Date(day.date + 'T00:00:00')
      
      if (prevDateObj) {
        const dayDiff = Math.floor((currentDateObj.getTime() - prevDateObj.getTime()) / (24 * 60 * 60 * 1000))
        
        if (dayDiff === 1) {
          // Consecutive day
          tempStreak++
        } else {
          // Gap in streak, start new streak
          tempStreak = 1
        }
      } else {
        // First day
        tempStreak = 1
      }
      
      longestStreak = Math.max(longestStreak, tempStreak)
      prevDateObj = currentDateObj
    }
    
    return NextResponse.json({
      currentStreak: currentStreak || 0,
      longestStreak: longestStreak || 0,
      totalDays: totalDays || 0,
      totalHours: totalHours ? Math.round(totalHours * 10) / 10 : 0
    })
    
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}