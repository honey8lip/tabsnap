const { filterByBrowser, filterByDateRange, filterByMinTabs, filterByDomain, applyFilters } = require('./filter');

const sessions = [
  { name: 'a', browser: 'chrome', savedAt: '2024-01-10T10:00:00Z', tabs: [{url:'https://github.com'},{url:'https://example.com'}] },
  { name: 'b', browser: 'firefox', savedAt: '2024-03-15T10:00:00Z', tabs: [{url:'https://news.ycombinator.com'}] },
  { name: 'c', browser: 'chrome', savedAt: '2024-06-01T10:00:00Z', tabs: [{url:'https://github.com'},{url:'https://google.com'},{url:'https://x.com'}] },
];

test('filterByBrowser returns matching sessions', () => {
  expect(filterByBrowser(sessions, 'chrome')).toHaveLength(2);
  expect(filterByBrowser(sessions, 'firefox')).toHaveLength(1);
});

test('filterByBrowser is case-insensitive', () => {
  expect(filterByBrowser(sessions, 'Chrome')).toHaveLength(2);
});

test('filterByDateRange filters correctly', () => {
  const result = filterByDateRange(sessions, '2024-02-01', '2024-05-01');
  expect(result).toHaveLength(1);
  expect(result[0].name).toBe('b');
});

test('filterByMinTabs filters by tab count', () => {
  expect(filterByMinTabs(sessions, 2)).toHaveLength(2);
  expect(filterByMinTabs(sessions, 3)).toHaveLength(1);
});

test('filterByDomain finds sessions with matching tab', () => {
  const result = filterByDomain(sessions, 'github.com');
  expect(result).toHaveLength(2);
});

test('applyFilters combines multiple filters', () => {
  const result = applyFilters(sessions, { browser: 'chrome', minTabs: 2 });
  expect(result).toHaveLength(2);
});

test('applyFilters with no opts returns all', () => {
  expect(applyFilters(sessions)).toHaveLength(3);
});
