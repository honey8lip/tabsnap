const { dedupeTabs, findDuplicates, dedupeAcrossSessions } = require('./dedupe');

const tabs = [
  { url: 'https://example.com', title: 'Example' },
  { url: 'https://foo.com', title: 'Foo' },
  { url: 'https://example.com', title: 'Example again' },
  { url: 'https://bar.com', title: 'Bar' },
  { url: 'https://foo.com', title: 'Foo 2' },
];

describe('dedupeTabs', () => {
  test('removes duplicate URLs, keeps first occurrence', () => {
    const result = dedupeTabs(tabs);
    expect(result).toHaveLength(3);
    expect(result.map(t => t.url)).toEqual([
      'https://example.com',
      'https://foo.com',
      'https://bar.com',
    ]);
  });

  test('returns same array when no duplicates', () => {
    const unique = [{ url: 'https://a.com' }, { url: 'https://b.com' }];
    expect(dedupeTabs(unique)).toHaveLength(2);
  });

  test('returns empty array for empty input', () => {
    expect(dedupeTabs([])).toEqual([]);
  });

  test('preserves title of first occurrence', () => {
    const result = dedupeTabs(tabs);
    const example = result.find(t => t.url === 'https://example.com');
    expect(example.title).toBe('Example');
    const foo = result.find(t => t.url === 'https://foo.com');
    expect(foo.title).toBe('Foo');
  });
});

describe('findDuplicates', () => {
  test('returns only duplicate entries', () => {
    const dupes = findDuplicates(tabs);
    expect(dupes).toHaveLength(2);
    expect(dupes[0].url).toBe('https://example.com');
    expect(dupes[1].url).toBe('https://foo.com');
  });

  test('returns empty when no duplicates', () => {
    expect(findDuplicates([{ url: 'https://x.com' }])).toEqual([]);
  });
});

describe('dedupeAcrossSessions', () => {
  test('removes tabs already seen in earlier sessions', () => {
    const sessions = [
      { name: 'a', tabs: [{ url: 'https://shared.com' }, { url: 'https://only-a.com' }] },
      { name: 'b', tabs: [{ url: 'https://shared.com' }, { url: 'https://only-b.com' }] },
    ];
    const result = dedupeAcrossSessions(sessions);
    expect(result[0].tabs).toHaveLength(2);
    expect(result[1].tabs).toHaveLength(1);
    expect(result[1].tabs[0].url).toBe('https://only-b.com');
  });

  test('does not mutate original sessions', () => {
    const sessions = [
      { name: 'a', tabs: [{ url: 'https://shared.com' }] },
      { name: 'b', tabs: [{ url: 'https://shared.com' }, { url: 'https://only-b.com' }] },
    ];
    dedupeAcrossSessions(sessions);
    expect(sessions[1].tabs).toHaveLength(2);
  });
});
