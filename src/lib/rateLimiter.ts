/**
 * Simple token-bucket rate limiter for client-side API call protection.
 */

interface RateLimiterOptions {
    maxRequests: number;
    windowMs: number;
}

class RateLimiter {
    private timestamps: number[] = [];
    private maxRequests: number;
    private windowMs: number;

    constructor({ maxRequests = 5, windowMs = 60_000 }: RateLimiterOptions) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
    }

    /**
     * Check if a request is allowed. Returns `{ allowed, retryAfterMs }`.
     */
    check(): { allowed: boolean; retryAfterMs: number } {
        const now = Date.now();
        // Remove expired timestamps
        this.timestamps = this.timestamps.filter((ts) => now - ts < this.windowMs);

        if (this.timestamps.length < this.maxRequests) {
            this.timestamps.push(now);
            return { allowed: true, retryAfterMs: 0 };
        }

        const oldest = this.timestamps[0];
        const retryAfterMs = this.windowMs - (now - oldest);
        return { allowed: false, retryAfterMs };
    }
}

// Shared limiter for AI endpoints (5 requests per 60 seconds)
export const aiRateLimiter = new RateLimiter({ maxRequests: 5, windowMs: 60_000 });

export { RateLimiter };
