const { trimToMax, trimByDomain, trimDuplicates, trimSummary } = require('./trim');

const makeSession = (urls) => ({
  name: 'test',
  tabs: urls.map((url, i) => ({ url, title: `Tab ${i}` })),
});

describe('trimToMax', () => {
  test('keeps all tabs when under limit', () => {
    const s = makeSession(['https://a.com', 'https://b.com']);
    expect(trimToMax(s, 5).tabs).toHaveLength(2);
  });

  test('trims to max keeping last tabs', () => {
    const s = makeSession(['https://a.com', 'https://b.com', 'https://c.com']);
    const result = trimToMax(s, 2);
    expect(result.tabs).toHaveLength(2);
    expect(result.tabs[0].url).toBe('https://b.com');
    expect(result.tabs[1].url).toBe('https://c.com');
  });

  test('handles null session gracefully', () => {
    expect(trimToMax(null, 5)).toBeNull();
  });
});

describe('trimByDomain', () => {
  test('removes tabs matching string domain', () => {
    const s = makeSession(['https://ads.com/x', 'https://good.com', 'https://ads.com/y']);
    const result = trimByDomain(s, 'ads.com');
    expect(result.tabs).toHaveLength(1);
    expect(result.tabs[0].url).toBe('https://good.com');
  });

  test('removes tabs matching regex', () => {
    const s = makeSession(['https://track.io/1', 'https://example.com', 'https://track.io/2']);
    const result = trimByDomain(s, /track\.io/);
    expect(result.tabs).toHaveLength(1);
  });

  test('returns session unchanged when no match', () => {
    const s = makeSession(['https://a.com', 'https://b.com']);
    expect(trimByDomain(s, 'nope.com').tabs).toHaveLength(2);
  });
});

describe('trimDuplicates', () => {
  test('removes duplicate URLs', () => {
    const s = makeSession(['https://a.com', 'https://b.com', 'https://a.com']);
    const result = trimDuplicates(s);
    expect(result.tabs).toHaveLength(2);
  });

  test('keeps first occurrence', () => {
    const s = makeSession(['https://a.com', 'https://a.com']);
    expect(trimDuplicates(s).tabs[0].title).toBe('Tab 0');
  });

  test('no duplicates returns same count', () => {
    const s = makeSession(['https://a.com', 'https://b.com']);
    expect(trimDuplicates(s).tabs).toHaveLength(2);
  });
});

describe('trimSummary', () => {
  test('reports correct counts', () => {
    const before = makeSession(['https://a.com', 'https://b.com', 'https://c.com']);
    const after = makeSession(['https://b.com']);
    const summary = trimSummary(before, after);
    expect(summary.before).toBe(3);
    expect(summary.after).toBe(1);
    expect(summary.removed).toBe(2);
  });
});
