interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const ipMap = new Map<string, RateLimitEntry>();

// Limit: 10 requests per 60 seconds per IP
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 10;
const MAX_MAP_ENTRIES = 5000;

/**
 * Checks in-memory rate limit for a client IP.
 * Automatically cleans up stale entries to prevent memory leaks.
 */
export function checkRateLimit(ip: string): {
  allowed: boolean;
  retryAfterSeconds: number;
} {
  const now = Date.now();

  // Periodically prune expired entries when the map grows
  if (ipMap.size > MAX_MAP_ENTRIES) {
    for (const [key, entry] of ipMap.entries()) {
      if (entry.resetAt <= now) {
        ipMap.delete(key);
      }
    }
  }

  const existing = ipMap.get(ip);

  if (!existing || existing.resetAt <= now) {
    ipMap.set(ip, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= MAX_REQUESTS) {
    const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    return { allowed: false, retryAfterSeconds };
  }

  existing.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

