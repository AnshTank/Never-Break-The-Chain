import { NextRequest, NextResponse } from 'next/server'
import { authorizeRequest, createAuthErrorResponse } from '@/lib/auth-middleware'
import { DatabaseService } from '@/lib/database'
import { validateRequest, validateQueryParams, progressUpdateSchema, progressQuerySchema } from '@/lib/validation'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    // Enhanced authorization with user existence check
    const authResult = await authorizeRequest(request, { checkUserExists: true });
    if (!authResult.success || !authResult.user) {
      return createAuthErrorResponse(authResult);
    }

    const { userId, email } = authResult.user;
    const { searchParams } = new URL(request.url)
    
    // Validate query parameters
    const queryValidation = validateQueryParams(progressQuerySchema, searchParams);
    if (!queryValidation.success) {
      return NextResponse.json({ error: queryValidation.error }, { status: 400 });
    }
    
    const { date, startDate, endDate } = queryValidation.data;

    if (date) {
      const progress = await DatabaseService.getDailyProgress(userId, date)
      return NextResponse.json(progress)
    } else if (startDate && endDate) {
      const progress = await DatabaseService.getProgressRange(userId, startDate, endDate)
      return NextResponse.json(progress)
    }
    
  } catch (error) {
    // console.error('Error fetching progress:', error)
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

    const { userId, email } = authResult.user;
    const body = await request.json()
    
    // Validate request body
    const validation = validateRequest(progressUpdateSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    
    const { date, updates } = validation.data;
    
    await DatabaseService.updateDailyProgress(userId, date, updates)
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    // console.error('Error updating progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}