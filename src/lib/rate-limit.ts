/**
 * Simple in-memory sliding-window rate limiter.
 *
 * Honest limitation: on serverless platforms (Vercel), each function
 * instance has its own memory, so this limits per-instance, not
 * globally across all instances. That's still a real deterrent against
 * a single abusive client hammering one warm instance, but it is NOT a
 * hard guarantee under high concurrency or multiple cold starts.
 *
 * For a hard global limit once you have real traffic, swap this for
 * Upstash Redis's @upstash/ratelimit — same call signature, ~10 lines
 * to change, no other code needs to move.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Periodic cleanup so this map doesn't grow unbounded over a long-lived
// server process.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}, 5 * 60 * 1000).unref?.();

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (existing.count >= limit) {
    return { success: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count++;
  return { success: true, remaining: limit - existing.count, resetAt: existing.resetAt };
}

/** Best-effort client identifier from standard proxy headers (Vercel sets these). */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}
