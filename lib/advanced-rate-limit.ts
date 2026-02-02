// Enterprise-grade rate limiting with sliding window
class SlidingWindowRateLimit {
  private windows = new Map<string, number[]>();
  private maxRequests: number;
  private windowMs: number;
  private maxKeys = 50000; // Prevent memory exhaustion

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    
    // Cleanup old entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  isAllowed(key: string): { allowed: boolean; resetTime?: number; remaining: number } {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // Get or create window for this key
    let requests = this.windows.get(key) || [];
    
    // Remove old requests outside the window
    requests = requests.filter(timestamp => timestamp > windowStart);
    
    // Check if limit exceeded
    if (requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...requests);
      const resetTime = oldestRequest + this.windowMs;
      
      return {
        allowed: false,
        resetTime,
        remaining: 0
      };
    }
    
    // Add current request
    requests.push(now);
    this.windows.set(key, requests);
    
    // Implement LRU eviction if too many keys
    if (this.windows.size > this.maxKeys) {
      const firstKey = this.windows.keys().next().value as string;
      if (firstKey) {
        this.windows.delete(firstKey);
      }
    }
    
    return {
      allowed: true,
      remaining: this.maxRequests - requests.length
    };
  }

  private cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    for (const [key, requests] of this.windows.entries()) {
      const validRequests = requests.filter(timestamp => timestamp > windowStart);
      
      if (validRequests.length === 0) {
        this.windows.delete(key);
      } else {
        this.windows.set(key, validRequests);
      }
    }
  }

  getStats() {
    return {
      activeKeys: this.windows.size,
      maxKeys: this.maxKeys
    };
  }
}

// Rate limit configurations for different endpoints
const rateLimiters = {
  // Authentication endpoints - stricter limits
  auth: new SlidingWindowRateLimit(10, 15 * 60 * 1000), // 10 requests per 15 minutes
  
  // API endpoints - moderate limits  
  api: new SlidingWindowRateLimit(100, 60 * 1000), // 100 requests per minute
  
  // General endpoints - generous limits
  general: new SlidingWindowRateLimit(1000, 60 * 1000), // 1000 requests per minute
  
  // Device registration - very strict
  device: new SlidingWindowRateLimit(5, 60 * 1000), // 5 requests per minute
};

export function checkAdvancedRateLimit(
  key: string, 
  type: 'auth' | 'api' | 'general' | 'device' = 'general'
): { allowed: boolean; resetTime?: number; remaining: number } {
  return rateLimiters[type].isAllowed(key);
}

export function getRateLimitStats() {
  return {
    auth: rateLimiters.auth.getStats(),
    api: rateLimiters.api.getStats(),
    general: rateLimiters.general.getStats(),
    device: rateLimiters.device.getStats(),
  };
}