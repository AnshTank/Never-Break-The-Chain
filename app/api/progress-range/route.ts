import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/jwt'
import { DatabaseService } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    
    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start date and end date are required' }, { status: 400 })
    }

    const progressData = await DatabaseService.getProgressRange(
      user.userId,
      startDate,
      endDate
    )

    return NextResponse.json(progressData)
    
  } catch (error) {
    // console.error('Error fetching progress range:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}