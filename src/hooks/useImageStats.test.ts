import { describe, it, expect, beforeEach } from 'vitest';
import { trackImageProcessed } from './useImageStats';

const STATS_KEY = 'gambaryuk_stats';

describe('trackImageProcessed', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('initializes stats and increments counter', () => {
        trackImageProcessed();
        const stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
        expect(stats.totalProcessed).toBe(1);
    });

    it('increments existing counter', () => {
        localStorage.setItem(STATS_KEY, JSON.stringify({ totalProcessed: 5, sessionStart: Date.now() }));
        trackImageProcessed();
        const stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
        expect(stats.totalProcessed).toBe(6);
    });

    it('increments by custom count', () => {
        trackImageProcessed(3);
        const stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
        expect(stats.totalProcessed).toBe(3);
    });
});
