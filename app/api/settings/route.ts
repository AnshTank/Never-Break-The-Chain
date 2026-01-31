import { NextRequest, NextResponse } from 'next/server'
import { authorizeRequest, createAuthErrorResponse } from '@/lib/auth-middleware'
import { DatabaseService } from '@/lib/database'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    // Enhanced authorization with user existence check
    const authResult = await authorizeRequest(request, { checkUserExists: true });
    if (!authResult.success || !authResult.user) {
      return createAuthErrorResponse(authResult);
    }

    const { email } = authResult.user;
    const settings = await DatabaseService.getUserSettings(email)
    
    return NextResponse.json(settings)
    
  } catch (error) {
    // console.error('Error fetching user settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Enhanced authorization with user existence check
    const authResult = await authorizeRequest(request, { checkUserExists: true });
    if (!authResult.success || !authResult.user) {
      return createAuthErrorResponse(authResult);
    }

    const { email } = authResult.user;
    const updates = await request.json()
    
    await DatabaseService.updateUserSettings(email, updates)
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    // console.error('Error updating user settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}