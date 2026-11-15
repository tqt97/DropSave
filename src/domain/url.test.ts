import { describe, expect, it } from 'vitest';
import { validateMediaUrl } from './url';

describe('validateMediaUrl', () => {
  it('accepts normal https URLs', () => expect(validateMediaUrl('https://example.com/video')).toEqual({ valid: true }));
  it('rejects local file URLs', () => expect(validateMediaUrl('file:///tmp/a.mp4').valid).toBe(false));
  it('rejects malformed values', () => expect(validateMediaUrl('hello').valid).toBe(false));
});
