import { describe, it, expect } from 'vitest';
import { formatFileSize, getExtension, detectFormat } from './imageProcessing';

describe('formatFileSize', () => {
    it('returns bytes for small values', () => {
        expect(formatFileSize(500)).toBe('500 B');
        expect(formatFileSize(0)).toBe('0 B');
    });

    it('returns KB for values between 1KB and 1MB', () => {
        expect(formatFileSize(1024)).toBe('1.0 KB');
        expect(formatFileSize(2048)).toBe('2.0 KB');
        expect(formatFileSize(1536)).toBe('1.5 KB');
    });

    it('returns MB for values >= 1MB', () => {
        expect(formatFileSize(1024 * 1024)).toBe('1.00 MB');
        expect(formatFileSize(2.5 * 1024 * 1024)).toBe('2.50 MB');
    });
});

describe('getExtension', () => {
    it('returns jpg for jpeg format', () => {
        expect(getExtension('jpeg')).toBe('jpg');
    });

    it('returns png for png format', () => {
        expect(getExtension('png')).toBe('png');
    });

    it('returns webp for webp format', () => {
        expect(getExtension('webp')).toBe('webp');
    });

    it('defaults to jpg for unknown formats', () => {
        expect(getExtension('bmp')).toBe('jpg');
        expect(getExtension('')).toBe('jpg');
    });
});

describe('detectFormat', () => {
    it('detects PNG from URL', () => {
        expect(detectFormat('blob:http://localhost/image.png')).toBe('png');
        expect(detectFormat('https://example.com/photo.PNG')).toBe('png');
    });

    it('detects WebP from URL', () => {
        expect(detectFormat('blob:http://localhost/image.webp')).toBe('webp');
    });

    it('defaults to JPEG for unknown URLs', () => {
        expect(detectFormat('blob:http://localhost/abc123')).toBe('jpeg');
        expect(detectFormat('https://example.com/photo.jpg')).toBe('jpeg');
    });
});
