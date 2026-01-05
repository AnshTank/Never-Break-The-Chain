import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { getUserFromRequest } from '@/lib/jwt'
import { ObjectId } from 'mongodb'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Get user from JWT token
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const users = db.collection('users')

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

    return NextResponse.json({ 
      message: 'Welcome completed successfully' 
    }, { status: 200 })

  } catch (error) {
    console.error('Complete welcome error occurred at:', new Date().toISOString(), error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}