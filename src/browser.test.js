import { describe, it, expect } from 'vitest';
import { parseTabs, formatSession, SUPPORTED_BROWSERS } from './browser.js';

describe('parseTabs', () => {
  it('filters out non-http tabs', () => {
    const raw = [
      { url: 'https://example.com', title: 'Example' },
      { url: 'chrome://newtab', title: 'New Tab' },
      { url: 'about:blank', title: 'Blank' },
    ];
    const result = parseTabs(raw);
    expect(result).toHaveLength(1);
    expect(result[0].url).toBe('https://example.com');
  });

  it('normalizes tab shape', () => {
    const raw = [{ url: 'https://github.com', pinned: true }];
    const result = parseTabs(raw);
    expect(result[0]).toMatchObject({
      title: 'Untitled',
      url: 'https://github.com',
      pinned: true,
    });
  });

  it('throws if input is not an array', () => {
    expect(() => parseTabs(null)).toThrow('Expected an array of tabs');
    expect(() => parseTabs({ url: 'https://x.com' })).toThrow();
  });

  it('returns empty array for empty input', () => {
    expect(parseTabs([])).toEqual([]);
  });
});

describe('formatSession', () => {
  it('includes browser, savedAt, tabCount, and tabs', () => {
    const tabs = [{ url: 'https://a.com', title: 'A', pinned: false }];
    const session = formatSession(tabs, 'chrome');
    expect(session.browser).toBe('chrome');
    expect(session.tabCount).toBe(1);
    expect(session.tabs).toEqual(tabs);
    expect(typeof session.savedAt).toBe('string');
  });

  it('defaults browser to unknown', () => {
    const session = formatSession([]);
    expect(session.browser).toBe('unknown');
  });
});

describe('SUPPORTED_BROWSERS', () => {
  it('includes common browsers', () => {
    expect(SUPPORTED_BROWSERS).toContain('chrome');
    expect(SUPPORTED_BROWSERS).toContain('firefox');
  });
});
