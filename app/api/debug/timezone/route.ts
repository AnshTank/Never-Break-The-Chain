import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const now = new Date();
  
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);
  
  const utcHour = now.getUTCHours();
  const istHour = istTime.getUTCHours();
  
  return NextResponse.json({
    server: {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      now: now.toISOString(),
      localTime: now.toLocaleString(),
    },
    utc: {
      time: now.toISOString(),
      hour: utcHour,
      date: now.toUTCString(),
    },
    ist: {
      time: istTime.toISOString(),
      hour: istHour,
      formatted: istTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    },
    windows: {
      morningUTC: '1:30 AM UTC = 7:00 AM IST',
      eveningUTC: '12:30 PM UTC = 6:00 PM IST',
      currentlyInMorningWindow: utcHour >= 1 && utcHour <= 3,
      currentlyInEveningWindow: utcHour >= 12 && utcHour <= 18,
    },
    cronAdvice: 'Set cron timezone to Asia/Kolkata OR use UTC times: Morning=01:30, Evening=12:30, Weekly=03:30 Sunday'
  });
}
