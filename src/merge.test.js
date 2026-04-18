const { mergeSessions, mergeSummary } = require('./merge');

const s1 = {
  name: 'work',
  tabs: [
    { url: 'https://github.com', title: 'GitHub' },
    { url: 'https://jira.example.com', title: 'Jira' },
  ],
  tags: ['work'],
};

const s2 = {
  name: 'research',
  tabs: [
    { url: 'https://github.com', title: 'GitHub' },
    { url: 'https://mdn.dev', title: 'MDN' },
  ],
  tags: ['dev'],
};

test('merges tabs from two sessions', () => {
  const merged = mergeSessions([s1, s2]);
  expect(merged.tabs).toHaveLength(4);
  expect(merged.name).toBe('work+research');
});

test('dedupes urls when dedupe=true', () => {
  const merged = mergeSessions([s1, s2], { dedupe: true });
  expect(merged.tabs).toHaveLength(3);
  const urls = merged.tabs.map(t => t.url);
  expect(new Set(urls).size).toBe(3);
});

test('uses custom label when provided', () => {
  const merged = mergeSessions([s1, s2], { label: 'combined' });
  expect(merged.name).toBe('combined');
});

test('merges tags from all sessions', () => {
  const merged = mergeSessions([s1, s2]);
  expect(merged.tags).toContain('work');
  expect(merged.tags).toContain('dev');
  expect(merged.tags).toHaveLength(2);
});

test('throws on empty sessions array', () => {
  expect(() => mergeSessions([])).toThrow();
});

test('throws on invalid session', () => {
  expect(() => mergeSessions([{ name: 'bad' }])).toThrow('missing tabs array');
});

test('mergeSummary reports contributions', () => {
  const merged = mergeSessions([s1, s2], { dedupe: true });
  const summary = mergeSummary([s1, s2], merged);
  expect(summary[0].name).toBe('work');
  expect(summary[0].contributed).toBeGreaterThan(0);
});
