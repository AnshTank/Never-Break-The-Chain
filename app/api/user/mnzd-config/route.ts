import { NextRequest, NextResponse } from 'next/server'
import { authorizeRequest, createAuthErrorResponse } from '@/lib/auth-middleware'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { validateRequest, mnzdConfigsSchema } from '@/lib/validation'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Enhanced authorization with user existence check
    const authResult = await authorizeRequest(request, { checkUserExists: true });
    if (!authResult.success || !authResult.user) {
      return createAuthErrorResponse(authResult);
    }

    const { userId } = authResult.user;
    const body = await request.json()
    
    // Validate request body with Zod
    const validation = validateRequest(mnzdConfigsSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    
    const { mnzdConfigs } = validation.data;

    const { db } = await connectToDatabase()
    const users = db.collection('users')
    
    // Update user with MNZD configurations - only for the authenticated user
    const updateResult = await users.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          mnzdConfigs,
          updatedAt: new Date()
        }
      }
    )
    
    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Save MNZD config error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}