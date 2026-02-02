// High-performance in-memory cache for enterprise scalability
class PerformanceCache {
  private cache = new Map<string, { data: any; expiry: number }>();
  private maxSize = 10000; // Maximum cache entries
  private defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL

  set(key: string, data: any, ttl: number = this.defaultTTL): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value as string;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    // Check if expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean expired entries periodically
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize
    };
  }
}

// Global cache instance
export const cache = new PerformanceCache();

// Cleanup expired entries every 2 minutes
if (typeof window === 'undefined') { // Server-side only
  setInterval(() => cache.cleanup(), 2 * 60 * 1000);
}

// Cache key generators
export const CacheKeys = {
  user: (userId: string) => `user:${userId}`,
  userProgress: (userId: string, date: string) => `progress:${userId}:${date}`,
  userDevices: (userId: string) => `devices:${userId}`,
  userSettings: (userId: string) => `settings:${userId}`,
  analytics: (userId: string, period: string) => `analytics:${userId}:${period}`,
};

// Cache TTL constants (in milliseconds)
export const CacheTTL = {
  SHORT: 1 * 60 * 1000,      // 1 minute
  MEDIUM: 5 * 60 * 1000,     // 5 minutes  
  LONG: 15 * 60 * 1000,      // 15 minutes
  VERY_LONG: 60 * 60 * 1000, // 1 hour
};