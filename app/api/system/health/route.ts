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

    const stats = {
      uptime: performanceMonitor.getUptime(),
      memory: performanceMonitor.getMemoryUsage()
    };
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      performance: {
        uptime: stats.uptime
      },
      memory: stats.memory || {
        used: process.memoryUsage().heapUsed / 1024 / 1024, // MB
        total: process.memoryUsage().heapTotal / 1024 / 1024, // MB
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get system stats' },
      { status: 500 }
    );
  }
}