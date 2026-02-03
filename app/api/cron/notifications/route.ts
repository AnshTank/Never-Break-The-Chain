import { NextRequest, NextResponse } from 'next/server';
import { NotificationScheduler } from '@/lib/notification-scheduler';
import { testEmailConnection } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const urlSecret = request.nextUrl.searchParams.get('secret');
    const cronSecret = process.env.CRON_SECRET || 'nbtc-secure-2025';
    
    const isAuthorized = 
      authHeader === `Bearer ${cronSecret}` || 
      urlSecret === cronSecret;
    
    if (!isAuthorized) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔍 Testing email connection...');
    const emailTest = await testEmailConnection();
    console.log(`📧 Email test: ${emailTest ? 'SUCCESS' : 'FAILED'}`);
    
    if (!emailTest) {
      return NextResponse.json({ 
        error: 'Email service unavailable',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    console.log('🕐 Starting notification tasks...');
    await NotificationScheduler.runScheduledTasks();
    
    return NextResponse.json({
      message: 'Scheduled tasks completed successfully',
      timestamp: new Date().toISOString(),
      emailTest: emailTest
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
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'nbtc-secure-2025';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    console.log('🧪 Manual test...');
    
    const emailTest = await testEmailConnection();
    await NotificationScheduler.runScheduledTasks();
    
    return NextResponse.json({
      message: 'Manual test completed',
      timestamp: new Date().toISOString(),
      emailTest
    });

  } catch (error) {
    console.error('❌ Manual test error:', error);
    return NextResponse.json(
      { 
        message: 'Manual test failed', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}