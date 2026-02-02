import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { deviceId } = await request.json()
    
    if (!deviceId) {
      return NextResponse.json({ error: 'Device ID required' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    
    // Check if device exists and is active
    const device = await db.collection('devices').findOne({
      deviceId,
      isActive: true
    })
    
    if (!device) {
      return NextResponse.json({ 
        isActive: false, 
        isRegistered: false 
      })
    }

    // Check if remember me is still valid
    const rememberMeValid = device.rememberMe && 
      device.rememberMeExpiry && 
      new Date(device.rememberMeExpiry) > new Date()

    return NextResponse.json({
      isActive: true,
      isRegistered: true,
      rememberMeValid,
      lastActive: device.lastActive
    })

  } catch (error) {
    console.error('Device status check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}