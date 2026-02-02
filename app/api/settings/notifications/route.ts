import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { verifyToken } from '@/lib/jwt'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value || request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const userId = new ObjectId(decoded.userId)

    // Get user's notification settings
    const user = await db.collection('users').findOne(
      { _id: userId },
      { projection: { notificationSettings: 1 } }
    )

    const defaultSettings = {
      morningNotifications: true,
      eveningNotifications: true,
      reminderNotifications: true,
      milestoneNotifications: true,
      streakNotifications: true,
      inactivityReminders: true,
      morningTime: '07:00',
      eveningTime: '20:00',
      reminderInterval: 4,
      weekendNotifications: true,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '07:00'
      }
    }

    const settings = user?.notificationSettings || defaultSettings

    return NextResponse.json({
      settings,
      message: 'Notification settings retrieved successfully'
    })

  } catch (error) {
    console.error('Get notification settings error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value || request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }

    const { settings } = await request.json()
    
    if (!settings) {
      return NextResponse.json({ message: 'Settings required' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const userId = new ObjectId(decoded.userId)

    // Validate settings structure
    const validatedSettings = {
      morningNotifications: Boolean(settings.morningNotifications),
      eveningNotifications: Boolean(settings.eveningNotifications),
      reminderNotifications: Boolean(settings.reminderNotifications),
      milestoneNotifications: Boolean(settings.milestoneNotifications),
      streakNotifications: Boolean(settings.streakNotifications),
      inactivityReminders: Boolean(settings.inactivityReminders),
      morningTime: settings.morningTime || '07:00',
      eveningTime: settings.eveningTime || '20:00',
      reminderInterval: Number(settings.reminderInterval) || 4,
      weekendNotifications: Boolean(settings.weekendNotifications),
      quietHours: {
        enabled: Boolean(settings.quietHours?.enabled),
        start: settings.quietHours?.start || '22:00',
        end: settings.quietHours?.end || '07:00'
      }
    }

    // Update user's notification settings
    await db.collection('users').updateOne(
      { _id: userId },
      { 
        $set: { 
          notificationSettings: validatedSettings,
          updatedAt: new Date()
        } 
      }
    )

    // Log settings change
    await db.collection('notification_settings_log').insertOne({
      userId,
      settings: validatedSettings,
      updatedAt: new Date(),
      userAgent: request.headers.get('user-agent')
    })

    return NextResponse.json({
      message: 'Notification settings updated successfully',
      settings: validatedSettings
    })

  } catch (error) {
    console.error('Update notification settings error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}