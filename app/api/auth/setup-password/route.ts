import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/jwt'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    
    if (!user?.userId || !user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { password } = await request.json()
    
    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const users = db.collection('users')
    
    // Find user by ObjectId
    const existingUser = await users.findOne({ _id: new ObjectId(user.userId) })
    
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12)
    
    // Update user with password and clear flags
    const updateResult = await users.updateOne(
      { _id: new ObjectId(user.userId) },
      { 
        $set: { 
          password: hashedPassword,
          needsPasswordSetup: false,
          isNewUser: false,
          passwordSetupCompletedAt: new Date(),
          updatedAt: new Date()
        }
      }
    )
    
    if (updateResult.modifiedCount === 0) {
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Setup password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}