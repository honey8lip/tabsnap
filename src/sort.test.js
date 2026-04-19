const { sortSessions, sortByDate, sortByName, sortByTabCount, sortByBrowser, SORT_KEYS } = require('./sort');

const sessions = [
  { name: 'work', browser: 'chrome', savedAt: '2024-01-10T10:00:00Z', tabs: [1, 2, 3] },
  { name: 'alpha', browser: 'firefox', savedAt: '2024-03-01T08:00:00Z', tabs: [1] },
  { name: 'zeta', browser: 'brave', savedAt: '2024-02-15T12:00:00Z', tabs: [1, 2] },
];

test('sortByDate desc puts newest first', () => {
  const result = sortByDate(sessions, 'desc');
  expect(result[0].name).toBe('alpha');
  expect(result[2].name).toBe('work');
});

test('sortByDate asc puts oldest first', () => {
  const result = sortByDate(sessions, 'asc');
  expect(result[0].name).toBe('work');
});

test('sortByName asc alphabetical', () => {
  const result = sortByName(sessions, 'asc');
  expect(result[0].name).toBe('alpha');
  expect(result[2].name).toBe('zeta');
});

test('sortByName desc reverse alphabetical', () => {
  const result = sortByName(sessions, 'desc');
  expect(result[0].name).toBe('zeta');
});

test('sortByTabCount desc puts most tabs first', () => {
  const result = sortByTabCount(sessions, 'desc');
  expect(result[0].tabs.length).toBe(3);
});

test('sortByTabCount asc puts fewest tabs first', () => {
  const result = sortByTabCount(sessions, 'asc');
  expect(result[0].tabs.length).toBe(1);
});

test('sortByBrowser asc alphabetical by browser', () => {
  const result = sortByBrowser(sessions, 'asc');
  expect(result[0].browser).toBe('brave');
});

test('sortSessions defaults to date desc', () => {
  const result = sortSessions(sessions);
  expect(result[0].name).toBe('alpha');
});

test('sortSessions by name', () => {
  const result = sortSessions(sessions, 'name', 'asc');
  expect(result[0].name).toBe('alpha');
});

test('sortSessions does not mutate original', () => {
  const copy = [...sessions];
  sortSessions(sessions, 'name');
  expect(sessions[0].name).toBe(copy[0].name);
});

test('SORT_KEYS contains expected keys', () => {
  expect(SORT_KEYS).toContain('date');
  expect(SORT_KEYS).toContain('name');
  expect(SORT_KEYS).toContain('tabs');
  expect(SORT_KEYS).toContain('browser');
});
