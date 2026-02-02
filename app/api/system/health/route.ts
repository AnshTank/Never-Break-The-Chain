import { NextRequest, NextResponse } from 'next/server';
import { performanceMonitor } from '@/lib/enterprise-init';
import { verifyToken } from '@/lib/jwt';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Basic auth check - only for authenticated users
    const token = request.cookies.get('auth-token')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = performanceMonitor.getStats();
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      performance: {
        requests: stats.requests,
        errors: stats.errors,
        errorRate: stats.errorRate,
        avgResponseTime: parseFloat(stats.avgResponseTime.toFixed(2)),
        requestsPerMinute: parseFloat(stats.requestsPerMinute.toFixed(2)),
        uptime: stats.uptime
      },
      cache: stats.cache,
      rateLimit: stats.rateLimit,
      memory: {
        used: process.memoryUsage().heapUsed / 1024 / 1024, // MB
        total: process.memoryUsage().heapTotal / 1024 / 1024, // MB
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        cpuUsage: process.cpuUsage()
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get system stats' },
      { status: 500 }
    );
  }
}