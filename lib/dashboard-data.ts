import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/jwt'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import type { JourneyData } from '@/lib/types'

export async function getDashboardData(): Promise<{
  currentMonthData: JourneyData
  yearData: JourneyData
} | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value || cookieStore.get('token')?.value
    
    if (!token) return null
    
    const decoded = verifyToken(token)
    if (!decoded) return null
    
    const { db } = await connectToDatabase()
    const userId = new ObjectId(decoded.userId)
    
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    
    // Fetch current month and full year data in parallel
    const [monthData, fullYearData, settings] = await Promise.all([
      db.collection('progress').find({
        userId,
        date: {
          $gte: `${year}-${String(month).padStart(2, '0')}-01`,
          $lte: `${year}-${String(month).padStart(2, '0')}-31`
        }
      }).toArray(),
      db.collection('progress').find({
        userId,
        date: {
          $gte: `${year}-01-01`,
          $lte: `${year}-12-31`
        }
      }).toArray(),
      db.collection('users').findOne({ _id: userId }, { projection: { mnzdConfigs: 1 } })
    ])
    
    const mnzdConfigs = settings?.mnzdConfigs || []
    
    // Transform data
    const transformData = (data: any[]) => {
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
    
    return {
      currentMonthData: transformData(monthData),
      yearData: transformData(fullYearData)
    }
  } catch (error) {
    return null
  }
}