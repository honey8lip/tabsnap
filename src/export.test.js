import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toHtml, toMarkdown, exportSession } from './export.js';
import * as storage from './storage.jsst mockSession = {
  name: 'work',
  savedAt: '2024-01-15:00.000Z',
  tabs: [
    { url: 'https://github.com', title: 'GitHub' },
    { url: 'https://example.com', title: 'Example & More' },
  ],
};

describe('toHtml', () => {
  it('includes session name as folder', () => {
    const html = toHtml(mockSession);
    expect(html).toContain('<H3');
    expect(html).toContain('work');
  });

  it('includes tab urls and titles', () => {
    const html = toHtml(mockSession);
    expect(html).toContain('https://github.com');
    expect(html).toContain('GitHub');
  });

  it('escapes special characters in titles', () => {
    const html = toHtml(mockSession);
    expect(html).toContain('Example &amp; More');
  });
});

describe('toMarkdown', () => {
  it('starts with session name as heading', () => {
    const md = toMarkdown(mockSession);
    expect(md.startsWith('# work')).toBe(true);
  });

  it('includes markdown links', () => {
    const md = toMarkdown(mockSession);
    expect(md).toContain('[GitHub](https://github.com)');
  });

  it('includes tab count', () => {
    const md = toMarkdown(mockSession);
    expect(md).toContain('2 tab(s)');
  });
});

describe('exportSession', () => {
  beforeEach(() => {
    vi.spyOn(storage, 'loadSession').mockResolvedValue(mockSession);
  });

  it('returns json string for json format', async () => {
    const out = await exportSession('work', 'json');
    expect(JSON.parse(out).name).toBe('work');
  });

  it('throws on unknown format', async () => {
    await expect(exportSession('work', 'csv')).rejects.toThrow('Unknown format');
  });

  it('throws when session not found', async () => {
    storage.loadSession.mockResolvedValue(null);
    await expect(exportSession('nope', 'json')).rejects.toThrow('not found');
  });
});
