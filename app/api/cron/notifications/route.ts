import { NextRequest, NextResponse } from 'next/server';
import { testEmailConnection } from '@/lib/email-service';
import { EnhancedNotificationScheduler } from '@/lib/dynamic-notification-scheduler';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const urlSecret = request.nextUrl.searchParams.get('secret');
    const cronSecret = process.env.CRON_SECRET || 'nbtc-secure-2026';
    
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

    console.log('📧 Starting dynamic email notification delivery...');
    const results = await EnhancedNotificationScheduler.scheduleNotifications();
    
    return NextResponse.json({
      message: 'Dynamic email notification tasks completed successfully',
      timestamp: new Date().toISOString(),
      emailTest: emailTest,
      scheduler: 'dynamic-ai-v2',
      results: {
        sent: results.sent,
        failed: results.failed,
        types: results.types
      }
    });

  } catch (error) {
    console.error('❌ Email notification cron job error:', error);
    return NextResponse.json(
      { 
        message: 'Email notification cron job failed', 
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
    const cronSecret = process.env.CRON_SECRET || 'nbtc-secure-2026';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    console.log('🧪 Manual dynamic email notification test...');
    
    const emailTest = await testEmailConnection();
    const results = await EnhancedNotificationScheduler.scheduleNotifications();
    
    return NextResponse.json({
      message: 'Manual dynamic email notification test completed',
      timestamp: new Date().toISOString(),
      emailTest,
      scheduler: 'dynamic-ai-v2',
      results: {
        sent: results.sent,
        failed: results.failed,
        types: results.types
      }
    });

  } catch (error) {
    console.error('❌ Manual email notification test error:', error);
    return NextResponse.json(
      { 
        message: 'Manual email notification test failed', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}