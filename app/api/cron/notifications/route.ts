import { NextRequest, NextResponse } from 'next/server';
import { testEmailConnection } from '@/lib/email-service';
import { EnhancedNotificationScheduler } from '@/lib/dynamic-notification-scheduler';

function getAuthStatus(request: NextRequest, cronSecret: string): { ok: boolean; reason?: string } {
  const authHeader = request.headers.get('authorization');
  const urlSecret = request.nextUrl.searchParams.get('secret');
  const headerSecret = request.headers.get('x-cron-secret');

  if (authHeader === `Bearer ${cronSecret}`) return { ok: true };
  if (headerSecret === cronSecret) return { ok: true };
  if (urlSecret === cronSecret) return { ok: true };

  if (!authHeader && !headerSecret && !urlSecret) {
    return { ok: false, reason: 'Missing authorization header or secret query param.' };
  }

  return { ok: false, reason: 'Invalid credentials.' };
}

function parseWindowParam(raw: string | null): 'auto' | 'morning' | 'evening' | 'weekly' | 'all' {
  switch ((raw || 'auto').toLowerCase()) {
    case 'morning':
      return 'morning';
    case 'evening':
      return 'evening';
    case 'weekly':
      return 'weekly';
    case 'all':
      return 'all';
    default:
      return 'auto';
  }
}

export async function POST(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET || 'nbtc-secure-2026';
    
    const auth = getAuthStatus(request, cronSecret);
    if (!auth.ok) {
      return NextResponse.json(
        {
          message: 'Unauthorized',
          reason: auth.reason,
          hint: 'Send header: Authorization: Bearer <CRON_SECRET> OR add ?secret=<CRON_SECRET> to the URL.'
        },
        { status: 401 }
      );
    }


    const emailTest = await testEmailConnection();

    
    if (!emailTest) {
      return NextResponse.json({ 
        error: 'Email service unavailable',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }


    const now = new Date();
    const window = parseWindowParam(request.nextUrl.searchParams.get('window'));
    const dryRun = request.nextUrl.searchParams.get('dryRun') === '1';
    const results = await EnhancedNotificationScheduler.scheduleNotifications({ now, window, dryRun });

    const serverTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const warnings: string[] = [];
    if (!dryRun && results.sent === 0 && results.failed === 0 && results.skipped === 0) {
      warnings.push('No notifications were sent. This often means the cron ran outside the (morning/evening) time windows or no users are eligible.');
    }
    
    return NextResponse.json({
      message: 'Dynamic email notification tasks completed successfully',
      timestamp: now.toISOString(),
      emailTest: emailTest,
      scheduler: 'dynamic-ai-v2',
      server: {
        timezone: serverTimezone,
        nowIso: now.toISOString()
      },
      results: {
        sent: results.sent,
        failed: results.failed,
        skipped: results.skipped,
        eligibleUsers: results.eligibleUsers,
        window: results.window,
        dryRun,
        types: results.types
      },
      warnings
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
    const cronSecret = process.env.CRON_SECRET || 'nbtc-secure-2026';
    
    const auth = getAuthStatus(request, cronSecret);
    if (!auth.ok) {
      return NextResponse.json(
        {
          message: 'Unauthorized',
          reason: auth.reason,
          hint: 'Send header: Authorization: Bearer <CRON_SECRET> OR add ?secret=<CRON_SECRET> to the URL.'
        },
        { status: 401 }
      );
    }


    
    const emailTest = await testEmailConnection();
    const now = new Date();
    const window = parseWindowParam(request.nextUrl.searchParams.get('window'));
    const dryRun = request.nextUrl.searchParams.get('dryRun') === '1';
    const results = await EnhancedNotificationScheduler.scheduleNotifications({ now, window, dryRun });

    const serverTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const warnings: string[] = [];
    if (!dryRun && results.sent === 0 && results.failed === 0 && results.skipped === 0) {
      warnings.push('No notifications were sent. This often means the cron ran outside the (morning/evening) time windows or no users are eligible.');
    }
    
    return NextResponse.json({
      message: 'Manual dynamic email notification test completed',
      timestamp: now.toISOString(),
      emailTest,
      scheduler: 'dynamic-ai-v2',
      server: {
        timezone: serverTimezone,
        nowIso: now.toISOString()
      },
      results: {
        sent: results.sent,
        failed: results.failed,
        skipped: results.skipped,
        eligibleUsers: results.eligibleUsers,
        window: results.window,
        dryRun,
        types: results.types
      },
      warnings
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
