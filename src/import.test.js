import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseHtmlBookmarks, parseMarkdown, importSession } from './import.js';
import * as storage from './storage.js';

const sampleHtml = `
<!DOCTYPE NETSCAPE-Bookmark-file-1>
<DL><p>
  <DT><A HREF="https://github.com">GitHub</A>
  <DT><A HREF="https://example.com">Example</A>
  <DT><A HREF="ftp://skip.me">Skip</A>
</DL>`;

const sampleMd = `
# My Session

- [GitHub](https://github.com)
* [Example](https://example.com)
- [Skip](ftp://skip.me)
`;

describe('parseHtmlBookmarks', () => {
  it('extracts http links', () => {
    const tabs = parseHtmlBookmarks(sampleHtml);
    expect(tabs).toHaveLength(2);
    expect(tabs[0]).toEqual({ url: 'https://github.com', title: 'GitHub' });
  });

  it('filters out non-http links', () => {
    const tabs = parseHtmlBookmarks(sampleHtml);
    expect(tabs.every(t => t.url.startsWith('http'))).toBe(true);
  });
});

describe('parseMarkdown', () => {
  it('extracts markdown links', () => {
    const tabs = parseMarkdown(sampleMd);
    expect(tabs).toHaveLength(2);
    expect(tabs[1]).toEqual({ url: 'https://example.com', title: 'Example' });
  });

  it('ignores non-http links', () => {
    const tabs = parseMarkdown(sampleMd);
    expect(tabs.some(t => t.url.startsWith('ftp'))).toBe(false);
  });
});

describe('importSession', () => {
  beforeEach(() => {
    vi.spyOn(storage, 'saveSession').mockResolvedValue();
  });

  it('imports json array', async () => {
    const json = JSON.stringify([{ url: 'https://a.com', title: 'A' }]);
    const result = await importSession('test', json, 'json');
    expect(result.count).toBe(1);
    expect(storage.saveSession).toHaveBeenCalledWith('test', expect.objectContaining({ name: 'test' }));
  });

  it('throws on empty result', async () => {
    await expect(importSession('test', '[]', 'json')).rejects.toThrow('No valid tabs');
  });

  it('throws on unknown format', async () => {
    await expect(importSession('test', '', 'csv')).rejects.toThrow('Unknown format');
  });
});
