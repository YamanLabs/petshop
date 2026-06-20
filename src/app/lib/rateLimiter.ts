/**
 * In-memory rate limiter for API routes.
 * Tracks attempts per IP and blocks after exceeding the limit.
 * NOTE: This is a single-instance, in-memory solution suitable for
 * single-server deployments. For multi-instance/edge deployments,
 * use a Redis-backed solution (e.g., Upstash).
 */

interface AttemptRecord {
  count: number;
  firstAttemptAt: number;
  blockedUntil: number | null;
}

// Store: key = IP address, value = attempt record
const store = new Map<string, AttemptRecord>();

const MAX_ATTEMPTS = 10;           // Max attempts before blocking
const WINDOW_MS = 15 * 60 * 1000; // 15 minute rolling window
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minute block after exceeding

// Clean up old entries every 30 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of store.entries()) {
    // Remove entries where block has expired and window has passed
    if (
      (record.blockedUntil === null || now > record.blockedUntil) &&
      now - record.firstAttemptAt > WINDOW_MS
    ) {
      store.delete(key);
    }
  }
}, 30 * 60 * 1000);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number | null;
}

/**
 * Check and record a rate limit attempt for a given IP.
 * @param ip - The client IP address
 * @returns RateLimitResult - whether the request is allowed
 */
export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const record = store.get(ip);

  // No previous record — allow and start tracking
  if (!record) {
    store.set(ip, { count: 1, firstAttemptAt: now, blockedUntil: null });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1, retryAfterSeconds: null };
  }

  // Currently blocked
  if (record.blockedUntil !== null && now < record.blockedUntil) {
    const retryAfterSeconds = Math.ceil((record.blockedUntil - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  // Window has expired — reset
  if (now - record.firstAttemptAt > WINDOW_MS) {
    store.set(ip, { count: 1, firstAttemptAt: now, blockedUntil: null });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1, retryAfterSeconds: null };
  }

  // Within window, increment count
  record.count += 1;

  if (record.count > MAX_ATTEMPTS) {
    // Block the IP
    record.blockedUntil = now + BLOCK_DURATION_MS;
    store.set(ip, record);
    const retryAfterSeconds = Math.ceil(BLOCK_DURATION_MS / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  store.set(ip, record);
  return { allowed: true, remaining: MAX_ATTEMPTS - record.count, retryAfterSeconds: null };
}

/**
 * Extracts a best-effort client IP from Next.js request headers.
 * Falls back to '127.0.0.1' when not determinable.
 */
export function getClientIp(request: Request): string {
  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    // x-forwarded-for may be a comma-separated list; take the first entry
    return xForwardedFor.split(',')[0].trim();
  }
  const xRealIp = request.headers.get('x-real-ip');
  if (xRealIp) return xRealIp.trim();
  return '127.0.0.1';
}
