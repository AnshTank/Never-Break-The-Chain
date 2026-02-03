import { NextRequest, NextResponse } from 'next/server';
import { NotificationScheduler } from '@/lib/notification-scheduler';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'your-cron-secret-key';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    console.log('🧪 Manual notification test triggered...');
    
    // Force morning notifications
    await NotificationScheduler.sendMorningNotifications();
    
    return NextResponse.json({
      message: 'Test notifications sent',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Test notification error:', error);
    return NextResponse.json(
      { 
        message: 'Test failed', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Use POST to trigger test notifications' });
}