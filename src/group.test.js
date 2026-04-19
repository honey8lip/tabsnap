const { groupByTag, groupByDate, groupByBrowser, formatGroupSummary } = require('./group');

const sessions = {
  work: { tags: ['work'], browser: 'chrome', savedAt: '2024-03-01T10:00:00Z' },
  personal: { tags: ['personal'], browser: 'firefox', savedAt: '2024-03-01T12:00:00Z' },
  mixed: { tags: ['work', 'personal'], browser: 'chrome', savedAt: '2024-03-02T09:00:00Z' },
  bare: { browser: 'chrome', savedAt: '2024-03-02T11:00:00Z' },
};

test('groupByTag puts untagged sessions in untagged bucket', () => {
  const groups = groupByTag(sessions);
  expect(groups['untagged']).toHaveProperty('bare');
});

test('groupByTag puts session in multiple buckets if multiple tags', () => {
  const groups = groupByTag(sessions);
  expect(groups['work']).toHaveProperty('mixed');
  expect(groups['personal']).toHaveProperty('mixed');
});

test('groupByDate groups by ISO date string', () => {
  const groups = groupByDate(sessions);
  expect(Object.keys(groups)).toContain('2024-03-01');
  expect(Object.keys(groups)).toContain('2024-03-02');
  expect(Object.keys(groups['2024-03-01'])).toHaveLength(2);
});

test('groupByBrowser groups by browser field', () => {
  const groups = groupByBrowser(sessions);
  expect(Object.keys(groups['chrome'])).toHaveLength(3);
  expect(Object.keys(groups['firefox'])).toHaveLength(1);
});

test('formatGroupSummary returns one line per group', () => {
  const groups = groupByBrowser(sessions);
  const summary = formatGroupSummary(groups);
  expect(summary).toContain('chrome: 3 sessions');
  expect(summary).toContain('firefox: 1 session');
});
