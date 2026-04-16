import { describe, it, expect, vi, beforeEach } from 'vitest';
import { captureFromArray, summarize } from './capture.js';

vi.mock('./storage.js', () => ({
  saveSession: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('./browser.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    detectBrowser: vi.fn().mockReturnValue('chrome'),
  };
});

const sampleTabs = [
  { url: 'https://github.com', title: 'GitHub', pinned: true },
  { url: 'https://example.com', title: 'Example', pinned: false },
  { url: 'chrome://newtab', title: 'New Tab' },
];

describe('captureFromArray', () => {
  it('saves a session and returns it', async () => {
    const session = await captureFromArray(sampleTabs, 'my-session');
    expect(session.tabCount).toBe(2);
    expect(session.browser).toBe('chrome');
    expect(session.tabs).toHaveLength(2);
  });

  it('respects browser override in options', async () => {
    const session = await captureFromArray(sampleTabs, 'test', { browser: 'firefox' });
    expect(session.browser).toBe('firefox');
  });

  it('filters non-http tabs before saving', async () => {
    const session = await captureFromArray(sampleTabs, 'test');
    const urls = session.tabs.map(t => t.url);
    expect(urls.every(u => u.startsWith('http'))).toBe(true);
  });
});

describe('summarize', () => {
  it('returns a readable string summary', async () => {
    const session = await captureFromArray(sampleTabs, 'summary-test');
    const text = summarize(session);
    expect(text).toContain('chrome');
    expect(text).toContain('GitHub');
    expect(text).toContain('[P]');
    expect(text).toContain('https://example.com');
  });
});
