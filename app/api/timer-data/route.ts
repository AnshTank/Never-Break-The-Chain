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

    const userSettings = await DatabaseService.getUserSettings(user.email)
    
    if (!userSettings) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const timerData = userSettings.timerData || {
      sessions: [],
      stats: { todayMinutes: 0, todaySessions: 0, totalHours: 0, mnzdProgress: { code: 0, think: 0, express: 0, move: 0 } },
      tasks: [],
      pomodoroCount: 0,
      completedSessions: 0
    }

    return NextResponse.json(timerData)
  } catch (error) {
    // console.error('Error loading timer data:', error)
    return NextResponse.json({ error: 'Failed to load timer data' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const timerData = await request.json()

    await DatabaseService.updateUserSettings(user.email, { timerData })

    return NextResponse.json({ success: true })
  } catch (error) {
    // console.error('Error saving timer data:', error)
    return NextResponse.json({ error: 'Failed to save timer data' }, { status: 500 })
  }
}