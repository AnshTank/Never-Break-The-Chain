import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { getUserFromRequest } from '@/lib/jwt'
import { ObjectId } from 'mongodb'
import { MNZDConfig } from '@/lib/models-new'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Get user from JWT token
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { mnzdConfigs } = body

    const { db } = await connectToDatabase()
    const users = db.collection('users')
    const userSettings = db.collection('userSettings')

    // Update user to mark welcome as completed
    await users.updateOne(
      { _id: new ObjectId(user.userId) },
      { 
        $set: { 
          isNewUser: false,
          welcomeCompletedAt: new Date()
        } 
      }
    )

    // Save MNZD configurations to user settings using email as userId
    if (mnzdConfigs && Array.isArray(mnzdConfigs)) {
      // Ensure MNZD configs have all required fields
      const processedConfigs = mnzdConfigs.map(config => ({
        id: config.id,
        name: config.name || config.id.charAt(0).toUpperCase() + config.id.slice(1),
        description: config.description || '',
        minMinutes: config.minMinutes || 15,
        color: config.color || '#3b82f6' // Default blue color if not provided
      }))

      await userSettings.updateOne(
        { userId: user.email }, // Use email from JWT as userId
        {
          $set: {
            mnzdConfigs: processedConfigs,
            updatedAt: new Date(),
            welcomeCompleted: true
          },
          $setOnInsert: {
            userId: user.email, // Use email from JWT as userId
            newUser: false,
            createdAt: new Date()
          }
        },
        { upsert: true }
      )
    }

    return NextResponse.json({ 
      message: 'Welcome completed successfully' 
    }, { status: 200 })

  } catch (error) {
    // console.error('Complete welcome error occurred at:', new Date().toISOString(), error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}