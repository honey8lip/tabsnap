import { describe, it, expect, vi, beforeEach } from 'vitest';
import { packSession, unpackSession, isCompressed } from './compress.js';

const mockSession = {
  name: 'test',
  savedAt: '2024-01-01T00:00:00Z',
  browser: 'firefox',
  tabs: [{ title: 'MDN', url: 'https://developer.mozilla.org' }]
};

describe('compress cli helpers (unit)', () => {
  it('packSession produces a compressed wrapper', () => {
    const packed = packSession(mockSession);
    expect(packed.__compressed).toBe(true);
    expect(packed.__version).toBe(1);
    expect(packed.meta.name).toBe('test');
    expect(packed.meta.tabCount).toBe(1);
  });

  it('unpackSession restores original data', () => {
    const packed = packSession(mockSession);
    const restored = unpackSession(packed);
    expect(restored.name).toBe('test');
    expect(restored.tabs).toHaveLength(1);
    expect(restored.tabs[0].url).toBe('https://developer.mozilla.org');
  });

  it('isCompressed distinguishes packed from plain', () => {
    expect(isCompressed(packSession(mockSession))).toBe(true);
    expect(isCompressed(mockSession)).toBe(false);
    expect(isCompressed(null)).toBe(false);
    expect(isCompressed({})).toBe(false);
  });

  it('packing is idempotent in detection', () => {
    const packed = packSession(mockSession);
    expect(isCompressed(packed)).toBe(true);
    const unpacked = unpackSession(packed);
    expect(isCompressed(unpacked)).toBe(false);
  });

  it('meta includes ratio and saved bytes', () => {
    const packed = packSession(mockSession);
    expect(typeof packed.meta.ratio).toBe('number');
    expect(typeof packed.meta.saved).toBe('number');
    expect(typeof packed.meta.originalBytes).toBe('number');
    expect(packed.meta.originalBytes).toBeGreaterThan(0);
  });
});
