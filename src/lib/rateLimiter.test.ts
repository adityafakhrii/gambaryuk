import { describe, it, expect } from 'vitest';
import { RateLimiter } from './rateLimiter';

describe('RateLimiter', () => {
    it('allows requests within the limit', () => {
        const limiter = new RateLimiter({ maxRequests: 3, windowMs: 60_000 });
        expect(limiter.check().allowed).toBe(true);
        expect(limiter.check().allowed).toBe(true);
        expect(limiter.check().allowed).toBe(true);
    });

    it('blocks requests exceeding the limit', () => {
        const limiter = new RateLimiter({ maxRequests: 2, windowMs: 60_000 });
        limiter.check();
        limiter.check();
        const result = limiter.check();
        expect(result.allowed).toBe(false);
        expect(result.retryAfterMs).toBeGreaterThan(0);
    });
});
