import { NextRequest, NextResponse } from 'next/server'

// DEPRECATED: This endpoint has been replaced by /api/cron/notifications
// Using the new SmartNotificationScheduler system

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'This endpoint is deprecated. Use /api/cron/notifications instead.',
    deprecated: true,
    replacement: '/api/cron/notifications',
    timestamp: new Date().toISOString()
  }, { status: 410 }) // Gone
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    message: 'This endpoint is deprecated. Use /api/cron/notifications instead.',
    deprecated: true,
    replacement: '/api/cron/notifications',
    timestamp: new Date().toISOString()
  }, { status: 410 }) // Gone
}