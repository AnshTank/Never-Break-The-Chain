import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // This endpoint is called when the browser is closing
    // We can perform any cleanup operations here
    
    // For now, just return success
    // In the future, you might want to:
    // - Log the session end
    // - Clean up any temporary data
    // - Update user's last seen timestamp
    
    return NextResponse.json({ message: 'Cleanup completed' }, { status: 200 })
  } catch (error) {
    // console.error('Cleanup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}