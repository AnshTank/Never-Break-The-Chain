import { NextRequest, NextResponse } from 'next/server'
import { authorizeRequest, createAuthErrorResponse } from '@/lib/auth-middleware'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    // Enhanced authorization with user existence check
    const authResult = await authorizeRequest(request, { checkUserExists: true });
    if (!authResult.success || !authResult.user) {
      return createAuthErrorResponse(authResult);
    }

    const { userId } = authResult.user;
    const { db } = await connectToDatabase()
    const users = db.collection('users')
    const userData = await users.findOne(
      { email: userId },
      { projection: { email: 1, name: 1, isNewUser: 1, needsPasswordSetup: 1 } }
    )
    
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      email: userData.email,
      name: userData.name,
      isNewUser: userData.isNewUser || false,
      needsPasswordSetup: userData.needsPasswordSetup || false
    })
    
  } catch (error) {
    // console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await authorizeRequest(request, { checkUserExists: true });
    if (!authResult.success || !authResult.user) {
      return createAuthErrorResponse(authResult);
    }

    const { userId } = authResult.user;
    const { name } = await request.json()
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const users = db.collection('users')
    
    const result = await users.updateOne(
      { email: userId },
      { 
        $set: { 
          name: name.trim(),
          updatedAt: new Date()
        }
      }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true, message: 'Profile updated successfully' })
    
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}