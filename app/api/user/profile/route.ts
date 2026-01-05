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
    const userData = await users.findOne(
      { _id: new ObjectId(user.userId) },
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
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}