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
    const date = searchParams.get('date')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (date) {
      const progress = await DatabaseService.getDailyProgress(user.email, date)
      return NextResponse.json(progress)
    } else if (startDate && endDate) {
      const progress = await DatabaseService.getProgressRange(user.email, startDate, endDate)
      return NextResponse.json(progress)
    } else {
      return NextResponse.json({ error: 'Date or date range required' }, { status: 400 })
    }
    
  } catch (error) {
    // console.error('Error fetching progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    
    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { date, updates } = body
    
    if (!date || !updates) {
      return NextResponse.json({ error: 'Date and updates are required' }, { status: 400 })
    }
    
    await DatabaseService.updateDailyProgress(user.email, date, updates)
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    // console.error('Error updating progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}