import { NextRequest, NextResponse } from 'next/server'

// DEPRECATED: This endpoint has been replaced by the SmartNotificationScheduler
// All notification scheduling is now handled by /api/cron/notifications

export async function POST(request: NextRequest) {
  return NextResponse.json({
    message: 'This endpoint is deprecated. Notifications are now handled by the SmartNotificationScheduler.',
    deprecated: true,
    replacement: '/api/cron/notifications',
    newSystem: 'SmartNotificationScheduler with dynamic templates',
    timestamp: new Date().toISOString()
  }, { status: 410 }) // Gone
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'This endpoint is deprecated. Notifications are now handled by the SmartNotificationScheduler.',
    deprecated: true,
    replacement: '/api/cron/notifications',
    newSystem: 'SmartNotificationScheduler with dynamic templates',
    timestamp: new Date().toISOString()
  }, { status: 410 }) // Gone
}