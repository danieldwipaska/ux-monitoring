interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum number of requests per window
}

export function rateLimit(config: RateLimitConfig) {
  return (identifier: string): { allowed: boolean; remaining: number; resetTime: number } => {
    const now = Date.now();
    const record = store[identifier];

    // Clean up old records periodically
    if (Math.random() < 0.01) {
      Object.keys(store).forEach((key) => {
        if (store[key].resetTime < now) {
          delete store[key];
        }
      });
    }

    if (!record || record.resetTime < now) {
      // Create new record or reset expired one
      store[identifier] = {
        count: 1,
        resetTime: now + config.windowMs,
      };
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: store[identifier].resetTime,
      };
    }

    if (record.count < config.maxRequests) {
      // Increment count
      record.count++;
      return {
        allowed: true,
        remaining: config.maxRequests - record.count,
        resetTime: record.resetTime,
      };
    }

    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  };
}

// Predefined rate limiters
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts per 15 minutes
});

export const logRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 1000, // 1000 logs per minute per API key
});
