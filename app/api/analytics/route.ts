import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/jwt'
import { DatabaseService } from '@/lib/database'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic' // Disable all caching
export const revalidate = 0 // Never cache

// Sanitize and validate month parameter
function validateMonthParam(monthParam: string | null): Date | null {
  if (!monthParam) return null
  
  // Only allow YYYY-MM-DD format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(monthParam)) {
    console.warn('Invalid month format:', monthParam)
    return null
  }
  
  const date = new Date(monthParam)
  if (isNaN(date.getTime())) {
    console.warn('Invalid date:', monthParam)
    return null
  }
  
  // Prevent future dates beyond reasonable range
  const maxDate = new Date()
  maxDate.setFullYear(maxDate.getFullYear() + 1)
  
  if (date > maxDate) {
    console.warn('Date too far in future:', monthParam)
    return null
  }
  
  return date
}

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    
    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const monthParam = searchParams.get('month')

    // Validate and sanitize month parameter
    const validatedDate = validateMonthParam(monthParam)
    
    // Get user settings for minimum requirements
    const userSettings = await DatabaseService.getUserSettings(user.userId)
    const mnzdConfigs = userSettings?.mnzdConfigs || []

    // Get specific month's data
    let targetDate: Date
    if (validatedDate) {
      targetDate = validatedDate
      console.log(`📊 Analytics API: monthParam received: ${monthParam}`);
      console.log(`📊 Analytics API: targetDate parsed: ${targetDate.toISOString()}`);
    } else {
      targetDate = new Date()
    }
    
    const year = targetDate.getUTCFullYear()
    const month = targetDate.getUTCMonth() + 1
    const startOfMonth = `${year}-${String(month).padStart(2, '0')}-01`
    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate()
    const endOfMonth = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
    
    console.log(`📊 Analytics API: Fetching for month ${startOfMonth} to ${endOfMonth}`);
    
    // Get data for streak calculation (last 365 days + current month)
    const oneYearAgo = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth() - 12, 1))
    const startDate = `${oneYearAgo.getUTCFullYear()}-${String(oneYearAgo.getUTCMonth() + 1).padStart(2, '0')}-01`
    
    const allData = await DatabaseService.getProgressRange(
      user.userId, 
      startDate, 
      endOfMonth
    )
    
    console.log(`📊 Analytics API: Retrieved ${allData.length} days of data`);
    
    const monthlyData = allData.filter(day => day.date >= startOfMonth && day.date <= endOfMonth)
    console.log(`📊 Analytics API: Filtered to ${monthlyData.length} days for target month`);

    // Calculate metrics from database data
    const totalHours = monthlyData.reduce((sum, day) => sum + (day.totalHours || 0), 0)
    const totalDays = monthlyData.filter(day => (day.totalHours || 0) > 0).length
    
    console.log(`📊 Analytics API: Total hours: ${totalHours}, Total days: ${totalDays}`);
    
    // Calculate MNZD streaks - only count days where ALL 4 tasks are completed
    const completedDays = allData.filter(day => {
      if (!day.tasks || day.tasks.length < 4) return false
      
      // Check if all 4 MNZD tasks are marked as completed
      return day.tasks.every(task => task.completed === true)
    }).sort((a, b) => a.date.localeCompare(b.date))
    
    console.log(`📊 Analytics API: ${completedDays.length} fully completed days found`);
    
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
    
    console.log(`📊 Analytics API: Current streak: ${currentStreak}, Longest streak: ${longestStreak}`);
    
    const response = NextResponse.json({
      currentStreak: currentStreak || 0,
      longestStreak: longestStreak || 0,
      totalDays: totalDays || 0,
      totalHours: totalHours ? Math.round(totalHours * 10) / 10 : 0
    })
    
    // Add cache-control headers to prevent Vercel caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
    
  } catch (error) {
    console.error('❌ Error fetching analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}