import { describe, it, expect, vi } from 'vitest';
import { parseSyncTarget, validateBundle, formatBundleAge, bundleSummary } from './sync-utils.js';

describe('parseSyncTarget', () => {
  it('returns null for empty input', () => {
    expect(parseSyncTarget(null)).toBeNull();
  });
  it('parses file:// prefix', () => {
    expect(parseSyncTarget('file:///tmp/bundle.json')).toEqual({ type: 'file', path: '/tmp/bundle.json' });
  });
  it('parses http url', () => {
    expect(parseSyncTarget('https://example.com/bundle')).toEqual({ type: 'http', url: 'https://example.com/bundle' });
  });
  it('treats plain path as file', () => {
    expect(parseSyncTarget('/tmp/bundle.json')).toEqual({ type: 'file', path: '/tmp/bundle.json' });
  });
});

describe('validateBundle', () => {
  it('rejects non-object', () => {
    expect(validateBundle(null)).toBeTruthy();
  });
  it('rejects wrong version', () => {
    expect(validateBundle({ version: 2, sessions: {} })).toContain('version');
  });
  it('rejects missing sessions', () => {
    expect(validateBundle({ version: 1 })).toContain('sessions');
  });
  it('accepts valid bundle', () => {
    expect(validateBundle({ version: 1, sessions: {} })).toBeNull();
  });
});

describe('formatBundleAge', () => {
  it('returns unknown for missing exported', () => {
    expect(formatBundleAge({})).toBe('unknown age');
  });
  it('shows minutes for recent bundle', () => {
    const bundle = { exported: new Date(Date.now() - 5 * 60000).toISOString() };
    expect(formatBundleAge(bundle)).toMatch(/m ago/);
  });
});

describe('bundleSummary', () => {
  it('counts sessions and shows age', () => {
    const bundle = { version: 1, exported: new Date().toISOString(), sessions: { a: {}, b: {} } };
    const s = bundleSummary(bundle);
    expect(s).toContain('2 session(s)');
  });
});
