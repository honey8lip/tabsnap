const { buildDigest, formatDigest, digestSummaryLine } = require('./digest');

const makeSess = (name, tabs, opts = {}) => ({
  name,
  savedAt: opts.savedAt || '2024-03-01T10:00:00.000Z',
  tabs: tabs.map(url => ({ url, title: url })),
  meta: { favorite: opts.favorite || false, pinned: opts.pinned || false, tags: opts.tags || [] }
});

describe('buildDigest', () => {
  it('returns zero digest for empty list', () => {
    const d = buildDigest([]);
    expect(d.total).toBe(0);
    expect(d.tabs).toBe(0);
    expect(d.avgTabs).toBe(0);
  });

  it('counts sessions and tabs', () => {
    const sessions = [
      makeSess('a', ['https://a.com', 'https://b.com']),
      makeSess('b', ['https://c.com'])
    ];
    const d = buildDigest(sessions);
    expect(d.total).toBe(2);
    expect(d.tabs).toBe(3);
    expect(d.avgTabs).toBe(2);
  });

  it('counts favorites', () => {
    const sessions = [
      makeSess('a', ['https://a.com'], { favorite: true }),
      makeSess('b', ['https://b.com'])
    ];
    const d = buildDigest(sessions);
    expect(d.favorites).toBe(1);
  });

  it('counts pinned', () => {
    const sessions = [
      makeSess('a', ['https://a.com'], { pinned: true }),
      makeSess('b', ['https://b.com'], { pinned: true })
    ];
    const d = buildDigest(sessions);
    expect(d.pinned).toBe(2);
  });

  it('collects tags', () => {
    const sessions = [
      makeSess('a', ['https://a.com'], { tags: ['work', 'research'] }),
      makeSess('b', ['https://b.com'], { tags: ['personal'] })
    ];
    const d = buildDigest(sessions);
    expect(d.tags).toContain('work');
    expect(d.tags).toContain('personal');
  });

  it('resolves oldest and newest dates', () => {
    const sessions = [
      makeSess('a', ['https://a.com'], { savedAt: '2024-01-01T00:00:00.000Z' }),
      makeSess('b', ['https://b.com'], { savedAt: '2024-06-01T00:00:00.000Z' })
    ];
    const d = buildDigest(sessions);
    expect(d.oldest).toBe('2024-01-01T00:00:00.000Z');
    expect(d.newest).toBe('2024-06-01T00:00:00.000Z');
  });
});

describe('formatDigest', () => {
  it('returns a multi-line string', () => {
    const d = buildDigest([makeSess('a', ['https://a.com'])]);
    const out = formatDigest(d);
    expect(out).toContain('Sessions');
    expect(out).toContain('Total tabs');
  });
});

describe('digestSummaryLine', () => {
  it('formats a one-liner', () => {
    const d = { total: 5, tabs: 20, favorites: 2 };
    const line = digestSummaryLine(d);
    expect(line).toBe('5 sessions, 20 tabs, 2 favorites');
  });
});
