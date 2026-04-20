import { describe, it, expect } from 'vitest';
import {
  formatTabsAsText,
  formatTabsAsMarkdown,
  formatTabsAsUrls,
  formatForClipboard
} from './clipboard.js';

const session = {
  name: 'work',
  tabs: [
    { title: 'GitHub', url: 'https://github.com' },
    { title: 'MDN', url: 'https://developer.mozilla.org' }
  ]
};

describe('formatTabsAsText', () => {
  it('includes session name', () => {
    expect(formatTabsAsText(session)).toContain('work');
  });
  it('includes urls', () => {
    expect(formatTabsAsText(session)).toContain('https://github.com');
  });
});

describe('formatTabsAsMarkdown', () => {
  it('formats as markdown links', () => {
    const md = formatTabsAsMarkdown(session);
    expect(md).toContain('[GitHub](https://github.com)');
  });
  it('includes h1 heading', () => {
    expect(formatTabsAsMarkdown(session)).toContain('# work');
  });
});

describe('formatTabsAsUrls', () => {
  it('returns one url per line', () => {
    const out = formatTabsAsUrls(session);
    expect(out.split('\n')).toHaveLength(2);
    expect(out).toContain('https://developer.mozilla.org');
  });
});

describe('formatForClipboard', () => {
  it('defaults to text format', () => {
    expect(formatForClipboard(session)).toContain('Session:');
  });
  it('handles markdown format', () => {
    expect(formatForClipboard(session, 'markdown')).toContain('# work');
  });
  it('handles urls format', () => {
    const out = formatForClipboard(session, 'urls');
    expect(out).not.toContain('GitHub');
    expect(out).toContain('https://github.com');
  });
  it('handles json format', () => {
    const out = formatForClipboard(session, 'json');
    expect(() => JSON.parse(out)).not.toThrow();
  });
});
