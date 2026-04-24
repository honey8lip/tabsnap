import { describe, it, expect } from 'vitest';
import {
  compressSession,
  decompressSession,
  compressSummary,
  packSession,
  unpackSession,
  isCompressed
} from './compress.js';

const mockSession = {
  name: 'work',
  savedAt: '2024-01-15T10:00:00Z',
  browser: 'chrome',
  tabs: [
    { title: 'GitHub', url: 'https://github.com' },
    { title: 'Google', url: 'https://google.com' }
  ]
};

describe('compressSession / decompressSession', () => {
  it('round-trips a session', () => {
    const compressed = compressSession(mockSession);
    const restored = decompressSession(compressed);
    expect(restored).toEqual(mockSession);
  });

  it('returns a base64 string', () => {
    const result = compressSession(mockSession);
    expect(typeof result).toBe('string');
    expect(() => Buffer.from(result, 'base64')).not.toThrow();
  });
});

describe('compressSummary', () => {
  it('returns ratio and sizes', () => {
    const json = JSON.stringify(mockSession);
    const compressed = compressSession(mockSession);
    const summary = compressSummary(json, compressed);
    expect(summary).toHaveProperty('originalBytes');
    expect(summary).toHaveProperty('compressedBytes');
    expect(summary).toHaveProperty('ratio');
    expect(summary).toHaveProperty('saved');
  });
});

describe('packSession / unpackSession', () => {
  it('packs and unpacks correctly', () => {
    const packed = packSession(mockSession);
    expect(packed.__compressed).toBe(true);
    expect(packed.meta.name).toBe('work');
    expect(packed.meta.tabCount).toBe(2);
    const unpacked = unpackSession(packed);
    expect(unpacked).toEqual(mockSession);
  });

  it('unpackSession returns plain session unchanged', () => {
    const result = unpackSession(mockSession);
    expect(result).toEqual(mockSession);
  });
});

describe('isCompressed', () => {
  it('returns true for packed sessions', () => {
    expect(isCompressed(packSession(mockSession))).toBe(true);
  });

  it('returns false for plain sessions', () => {
    expect(isCompressed(mockSession)).toBe(false);
  });
});
