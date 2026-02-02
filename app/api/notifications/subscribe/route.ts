import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { verifyToken } from '@/lib/jwt'
import { ObjectId } from 'mongodb'

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

    const { subscription } = await request.json()
    
    if (!subscription) {
      return NextResponse.json({ message: 'Push subscription required' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const userId = new ObjectId(decoded.userId)

    // Get device ID from headers or generate one
    const deviceId = request.headers.get('x-device-id') || 
                     request.cookies.get('device-id')?.value ||
                     `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Update or create device with push subscription
    await db.collection('devices').updateOne(
      { userId, deviceId },
      {
        $set: {
          pushSubscription: subscription,
          pushSubscriptionUpdated: new Date(),
          lastActive: new Date()
        },
        $setOnInsert: {
          userId,
          deviceId,
          deviceName: 'Web Browser',
          deviceType: 'desktop',
          browser: 'Unknown',
          os: 'Unknown',
          registeredAt: new Date(),
          isActive: true
        }
      },
      { upsert: true }
    )

    // Log subscription event
    await db.collection('push_subscription_log').insertOne({
      userId,
      deviceId,
      action: 'subscribe',
      subscription: {
        endpoint: subscription.endpoint,
        hasKeys: !!(subscription.keys?.p256dh && subscription.keys?.auth)
      },
      timestamp: new Date(),
      userAgent: request.headers.get('user-agent')
    })

    console.log(`✅ Push subscription registered for user ${userId} on device ${deviceId}`)

    return NextResponse.json({
      message: 'Push subscription registered successfully',
      deviceId,
      subscriptionActive: true
    })

  } catch (error) {
    console.error('Push subscription error:', error)
    return NextResponse.json(
      { message: 'Failed to register push subscription', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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

    // Get device ID
    const deviceId = request.headers.get('x-device-id') || 
                     request.cookies.get('device-id')?.value

    if (!deviceId) {
      return NextResponse.json({ message: 'Device ID required' }, { status: 400 })
    }

    // Remove push subscription from device
    await db.collection('devices').updateOne(
      { userId, deviceId },
      {
        $unset: { 
          pushSubscription: 1,
          pushSubscriptionUpdated: 1
        },
        $set: {
          lastActive: new Date()
        }
      }
    )

    // Log unsubscription event
    await db.collection('push_subscription_log').insertOne({
      userId,
      deviceId,
      action: 'unsubscribe',
      timestamp: new Date(),
      userAgent: request.headers.get('user-agent')
    })

    console.log(`🔕 Push subscription removed for user ${userId} on device ${deviceId}`)

    return NextResponse.json({
      message: 'Push subscription removed successfully',
      deviceId,
      subscriptionActive: false
    })

  } catch (error) {
    console.error('Push unsubscription error:', error)
    return NextResponse.json(
      { message: 'Failed to remove push subscription' },
      { status: 500 }
    )
  }
}