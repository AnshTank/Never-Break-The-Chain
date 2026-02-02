import { NextRequest, NextResponse } from 'next/server';
import { NotificationScheduler } from '@/lib/notification-scheduler';
import { DeviceSessionManager } from '@/lib/device-session-manager';

export async function POST(request: NextRequest) {
  try {
    // Check for auth in header or URL parameter
    const authHeader = request.headers.get('authorization');
    const urlSecret = request.nextUrl.searchParams.get('secret');
    const cronSecret = process.env.CRON_SECRET || 'your-cron-secret-key';
    
    const isAuthorized = 
      authHeader === `Bearer ${cronSecret}` || 
      urlSecret === cronSecret;
    
    if (!isAuthorized) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    console.log('🕐 Starting scheduled notification tasks...');
    
    // Run all scheduled tasks
    await NotificationScheduler.runScheduledTasks();
    
    // Clean up expired devices
    const cleanedDevices = await DeviceSessionManager.cleanupExpiredDevices();
    
    console.log(`✅ Scheduled tasks completed. Cleaned ${cleanedDevices} expired devices.`);
    
    return NextResponse.json({
      message: 'Scheduled tasks completed successfully',
      timestamp: new Date().toISOString(),
      cleanedDevices
    });

  } catch (error) {
    console.error('❌ Cron job error:', error);
    return NextResponse.json(
      { 
        message: 'Cron job failed', 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Allow GET for manual testing
export async function GET(request: NextRequest) {
  try {
    // Only allow in development or with proper auth
    if (process.env.NODE_ENV === 'production') {
      const authHeader = request.headers.get('authorization');
      const cronSecret = process.env.CRON_SECRET || 'your-cron-secret-key';
      
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
    }

    console.log('🧪 Manual cron job test...');
    
    await NotificationScheduler.runScheduledTasks();
    const cleanedDevices = await DeviceSessionManager.cleanupExpiredDevices();
    
    return NextResponse.json({
      message: 'Manual cron test completed',
      timestamp: new Date().toISOString(),
      cleanedDevices,
      environment: process.env.NODE_ENV
    });

  } catch (error) {
    console.error('❌ Manual cron test error:', error);
    return NextResponse.json(
      { 
        message: 'Manual cron test failed', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}