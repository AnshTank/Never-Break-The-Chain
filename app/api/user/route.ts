import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/jwt'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const users = db.collection('users')
    const userData = await users.findOne({ _id: new ObjectId(user.userId) })
    
    // If user doesn't exist (deleted account), return 401
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }
    
    return NextResponse.json({
      isNewUser: userData.isNewUser || false
    })
    
  } catch (error) {
    // console.error('Error fetching user status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { isNewUser } = await request.json()
    
    const { db } = await connectToDatabase()
    const users = db.collection('users')
    
    await users.updateOne(
      { _id: new ObjectId(user.userId) },
      { $set: { isNewUser: isNewUser } }
    )
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    // console.error('Error updating user status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}