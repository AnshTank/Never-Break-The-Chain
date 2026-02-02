// Enterprise startup initialization
import { initializeDatabaseOptimizations } from './database-optimization';
import { cache } from './cache';
import { getRateLimitStats } from './advanced-rate-limit';

// Performance monitoring
class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics = {
    requests: 0,
    errors: 0,
    avgResponseTime: 0,
    startTime: Date.now()
  };

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  recordRequest(responseTime: number, isError: boolean = false) {
    this.metrics.requests++;
    if (isError) this.metrics.errors++;
    
    // Calculate rolling average
    this.metrics.avgResponseTime = 
      (this.metrics.avgResponseTime * (this.metrics.requests - 1) + responseTime) / this.metrics.requests;
  }

  getStats() {
    const uptime = Date.now() - this.metrics.startTime;
    const errorRate = this.metrics.requests > 0 ? (this.metrics.errors / this.metrics.requests) * 100 : 0;
    
    return {
      ...this.metrics,
      uptime,
      errorRate: parseFloat(errorRate.toFixed(2)),
      requestsPerMinute: this.metrics.requests / (uptime / 60000),
      cache: cache.getStats(),
      rateLimit: getRateLimitStats()
    };
  }

  reset() {
    this.metrics = {
      requests: 0,
      errors: 0,
      avgResponseTime: 0,
      startTime: Date.now()
    };
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

// Initialize enterprise features
export async function initializeEnterprise() {
  try {
    console.log('🚀 Initializing enterprise features...');
    
    // Initialize database optimizations
    await initializeDatabaseOptimizations();
    
    // Start performance monitoring
    console.log('📊 Performance monitoring started');
    
    // Log system stats every 5 minutes in production
    if (process.env.NODE_ENV === 'production') {
      setInterval(() => {
        const stats = performanceMonitor.getStats();
        console.log('📈 System Stats:', {
          requests: stats.requests,
          errorRate: `${stats.errorRate}%`,
          avgResponseTime: `${stats.avgResponseTime.toFixed(2)}ms`,
          cacheSize: stats.cache.size,
          uptime: `${(stats.uptime / 60000).toFixed(1)}min`
        });
      }, 5 * 60 * 1000);
    }
    
    console.log('✅ Enterprise initialization complete');
    return true;
  } catch (error) {
    console.error('❌ Enterprise initialization failed:', error);
    return false;
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Graceful shutdown initiated');
  const stats = performanceMonitor.getStats();
  console.log('📊 Final stats:', stats);
  process.exit(0);
});

// Initialize on import in production
if (process.env.NODE_ENV === 'production') {
  initializeEnterprise();
}