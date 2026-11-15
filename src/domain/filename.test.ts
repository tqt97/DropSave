import { describe, expect, it } from 'vitest';
import { slugifyFilename } from './filename';

describe('slugifyFilename', () => {
  it('normalizes Vietnamese and unsafe punctuation', () => {
    expect(slugifyFilename('Hướng dẫn Laravel: Queue & Job #01 😍')).toBe('huong-dan-laravel-queue-job-01');
  });

  it('protects Windows reserved names', () => {
    expect(slugifyFilename('CON')).toBe('con-file');
  });

  it('provides fallback for emoji-only names', () => {
    expect(slugifyFilename('😍😍')).toBe('video');
  });
});
