import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/jwt'
import { DatabaseService } from '@/lib/database'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

function validateMonthParam(monthParam: string | null): Date | null {
  if (!monthParam) return null
  
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(monthParam)) return null
  
  const [year, month, day] = monthParam.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  
  if (isNaN(date.getTime())) return null
  
  const maxDate = new Date()
  maxDate.setFullYear(maxDate.getFullYear() + 1)
  
  if (date > maxDate) return null
  
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
    const validatedDate = validateMonthParam(monthParam)
    
    const targetDate = validatedDate || new Date()
    const year = targetDate.getFullYear()
    const month = targetDate.getMonth() + 1
    const startOfMonth = `${year}-${String(month).padStart(2, '0')}-01`
    const lastDay = new Date(year, month, 0).getDate()
    const endOfMonth = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
    
    const oneYearAgo = new Date(year, month - 13, 1)
    const startDate = `${oneYearAgo.getFullYear()}-${String(oneYearAgo.getMonth() + 1).padStart(2, '0')}-01`
    
    const allData = await DatabaseService.getProgressRange(user.userId, startDate, endOfMonth)
    const monthlyData = allData.filter(day => day.date >= startOfMonth && day.date <= endOfMonth)

    const totalHours = monthlyData.reduce((sum, day) => sum + (day.totalHours || 0), 0)
    const totalDays = monthlyData.filter(day => (day.totalHours || 0) > 0).length
    
    const completedDays = allData.filter(day => 
      day.tasks?.length >= 4 && day.tasks.every(task => task.completed === true)
    ).sort((a, b) => a.date.localeCompare(b.date))
    
    let currentStreak = 0, longestStreak = 0
    const today = new Date().toISOString().split('T')[0]
    let checkDate = new Date(today)
    
    const todayData = completedDays.find(d => d.date === today)
    if (todayData) {
      currentStreak = 1
      checkDate.setDate(checkDate.getDate() - 1)
      
      while (true) {
        const dayStr = checkDate.toISOString().split('T')[0]
        if (completedDays.find(d => d.date === dayStr)) {
          currentStreak++
          checkDate.setDate(checkDate.getDate() - 1)
        } else break
      }
    } else {
      checkDate.setDate(checkDate.getDate() - 1)
      while (true) {
        const dayStr = checkDate.toISOString().split('T')[0]
        if (completedDays.find(d => d.date === dayStr)) {
          currentStreak++
          checkDate.setDate(checkDate.getDate() - 1)
        } else break
      }
    }
    
    let tempStreak = 0, prevDateObj = null
    for (const day of completedDays) {
      const currentDateObj = new Date(day.date)
      if (prevDateObj) {
        const dayDiff = Math.floor((currentDateObj.getTime() - prevDateObj.getTime()) / 86400000)
        tempStreak = dayDiff === 1 ? tempStreak + 1 : 1
      } else tempStreak = 1
      longestStreak = Math.max(longestStreak, tempStreak)
      prevDateObj = currentDateObj
    }
    
    const response = NextResponse.json({
      currentStreak: currentStreak || 0,
      longestStreak: longestStreak || 0,
      totalDays: totalDays || 0,
      totalHours: totalHours ? Math.round(totalHours * 10) / 10 : 0
    })
    
    response.headers.set('Cache-Control', 'no-store, max-age=0')
    return response
    
  } catch (error) {
    console.error('❌ Error fetching analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
