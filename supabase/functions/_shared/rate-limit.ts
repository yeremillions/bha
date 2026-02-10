/**
 * Simple in-memory rate limiter for Supabase Edge Functions.
 * Uses a sliding window counter per IP address.
 *
 * Note: In a multi-instance deployment, this is per-isolate only.
 * For distributed rate limiting, use a shared store (Redis/Supabase table).
 * This still provides meaningful protection against single-origin abuse.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}, 60_000);

export interface RateLimitConfig {
  /** Max requests allowed in the window */
  maxRequests: number;
  /** Window size in seconds */
  windowSeconds: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 10,
  windowSeconds: 60,
};

/**
 * Check if a request is rate-limited.
 * Returns null if allowed, or a Response (429) if rate-limited.
 */
export function checkRateLimit(
  req: Request,
  corsHeaders: Record<string, string>,
  config: RateLimitConfig = DEFAULT_CONFIG
): Response | null {
  const clientIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  // Create a key that includes the function URL path for per-endpoint limiting
  const url = new URL(req.url);
  const key = `${clientIp}:${url.pathname}`;

  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    // Start a new window
    store.set(key, {
      count: 1,
      resetAt: now + config.windowSeconds * 1000,
    });
    return null;
  }

  entry.count++;

  if (entry.count > config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return new Response(
      JSON.stringify({ error: "Too many requests. Please try again later." }),
      {
        status: 429,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Retry-After": String(retryAfter),
        },
      }
    );
  }

  return null;
}
