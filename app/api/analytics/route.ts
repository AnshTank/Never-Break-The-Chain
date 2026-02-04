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
    // Count only days with actual progress (totalHours > 0)
    const totalDays = monthlyData.filter(day => (day.totalHours || 0) > 0).length
    
    // Calculate MNZD streaks
    const completedDays = allData.filter(day => {
      if (!day.tasks || day.tasks.length < 4) return false
      return day.tasks.every(task => task.minutes > 0)
    }).sort((a, b) => a.date.localeCompare(b.date))
    
    let currentStreak = 0
    let longestStreak = 0
    
    // Calculate current streak (excluding today)
    const today = new Date().toISOString().split('T')[0]
    let checkDate = new Date(today)
    checkDate.setDate(checkDate.getDate() - 1) // Start from yesterday
    
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
    
    // Calculate longest streak
    let streak = 0
    let prevDate: Date | null = null
    
    for (const day of completedDays) {
      const currentDate = new Date(day.date)
      
      if (prevDate && (currentDate.getTime() - prevDate.getTime()) === 24 * 60 * 60 * 1000) {
        streak++
      } else {
        streak = 1
      }
      
      longestStreak = Math.max(longestStreak, streak)
      prevDate = currentDate
    }
    
    return NextResponse.json({
      currentStreak: currentStreak || 0,
      longestStreak: longestStreak || 0,
      totalDays: totalDays || 0,
      totalHours: totalHours ? Math.round(totalHours * 10) / 10 : 0
    })
    
  } catch (error) {
    // console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}