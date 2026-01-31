// Rate limiting utility for authentication endpoints
import { NextRequest } from 'next/server';

interface RateLimitEntry {
  attempts: number;
  lastAttempt: number;
  blockedUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
}

export const defaultAuthRateLimit: RateLimitConfig = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 30 * 60 * 1000, // 30 minutes block
};

// Get client identifier from request
function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded ? forwarded.split(',')[0] : realIp || 'unknown';
  return ip;
}

// Apply rate limiting with request context
export async function applyRateLimit(
  request: NextRequest,
  action: string,
  maxAttempts: number,
  windowSeconds: number
): Promise<{ success: boolean; error?: string }> {
  const identifier = `${getClientIdentifier(request)}-${action}`;
  const config = {
    maxAttempts,
    windowMs: windowSeconds * 1000,
    blockDurationMs: windowSeconds * 1000
  };
  
  const result = checkRateLimit(identifier, config);
  
  if (!result.allowed) {
    const waitTime = result.resetTime ? Math.ceil((result.resetTime - Date.now()) / 1000) : windowSeconds;
    return {
      success: false,
      error: `Too many attempts. Please try again in ${waitTime} seconds.`
    };
  }
  
  return { success: true };
}

export function checkRateLimit(
  identifier: string, 
  config: RateLimitConfig = defaultAuthRateLimit
): { allowed: boolean; remainingAttempts: number; resetTime?: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // If no entry exists, allow and create new entry
  if (!entry) {
    rateLimitStore.set(identifier, {
      attempts: 1,
      lastAttempt: now,
    });
    return { allowed: true, remainingAttempts: config.maxAttempts - 1 };
  }

  // Check if currently blocked
  if (entry.blockedUntil && now < entry.blockedUntil) {
    return { 
      allowed: false, 
      remainingAttempts: 0, 
      resetTime: entry.blockedUntil 
    };
  }

  // Reset if window has passed
  if (now - entry.lastAttempt > config.windowMs) {
    rateLimitStore.set(identifier, {
      attempts: 1,
      lastAttempt: now,
    });
    return { allowed: true, remainingAttempts: config.maxAttempts - 1 };
  }

  // Increment attempts
  entry.attempts++;
  entry.lastAttempt = now;

  // Check if exceeded max attempts
  if (entry.attempts > config.maxAttempts) {
    entry.blockedUntil = now + config.blockDurationMs;
    rateLimitStore.set(identifier, entry);
    return { 
      allowed: false, 
      remainingAttempts: 0, 
      resetTime: entry.blockedUntil 
    };
  }

  rateLimitStore.set(identifier, entry);
  return { 
    allowed: true, 
    remainingAttempts: config.maxAttempts - entry.attempts 
  };
}

export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now - entry.lastAttempt > oneHour) {
      rateLimitStore.delete(key);
    }
  }
}, 10 * 60 * 1000); // Cleanup every 10 minutes