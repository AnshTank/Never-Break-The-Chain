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

    const settings = await DatabaseService.getUserSettings(user.email)
    
    return NextResponse.json(settings)
    
  } catch (error) {
    console.error('Error fetching user settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    
    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updates = await request.json()
    
    await DatabaseService.updateUserSettings(user.email, updates)
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Error updating user settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}