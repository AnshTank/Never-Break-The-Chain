import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/jwt'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    console.log('Setup password API called');
    const user = getUserFromRequest(request)
    console.log('User from JWT:', user ? 'Found' : 'Not found');
    
    if (!user?.userId || !user?.email) {
      console.log('No user found in JWT');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { password } = await request.json()
    console.log('Password received, length:', password?.length);
    
    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const users = db.collection('users')
    
    // Find user by ObjectId
    const existingUser = await users.findOne({ _id: new ObjectId(user.userId) })
    console.log('Found user in database:', existingUser ? 'Yes' : 'No');
    
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Hash the password
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 12)
    console.log('Password hashed successfully');
    
    // Update user with password and clear flags
    console.log('Updating user in database...');
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
    
    console.log('Update result:', updateResult.modifiedCount > 0 ? 'Success' : 'Failed');
    
    if (updateResult.modifiedCount === 0) {
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }
    
    console.log('Password setup completed successfully');
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Setup password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}