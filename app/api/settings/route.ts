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

    // Simple test response
    return NextResponse.json({ 
      message: 'Settings API working',
      user: user.email,
      mnzdConfigs: [
        { id: 'code', name: 'Code', description: 'Programming', minMinutes: 30, color: '#3b82f6' },
        { id: 'think', name: 'Think', description: 'Learning', minMinutes: 20, color: '#8b5cf6' },
        { id: 'express', name: 'Express', description: 'Writing', minMinutes: 15, color: '#06b6d4' },
        { id: 'move', name: 'Move', description: 'Exercise', minMinutes: 25, color: '#10b981' }
      ]
    })
    
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