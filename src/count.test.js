const {
  totalTabs,
  nonEmptySessions,
  averageTabCount,
  tabCountBreakdown,
  largestSession,
  formatCountSummary,
} = require('./count');

const make = (name, n) => ({
  name,
  tabs: Array.from({ length: n }, (_, i) => ({ url: `https://example.com/${i}`, title: `Tab ${i}` })),
});

const sessions = [make('work', 5), make('personal', 3), make('research', 8)];

test('totalTabs sums all tab counts', () => {
  expect(totalTabs(sessions)).toBe(16);
});

test('totalTabs returns 0 for empty list', () => {
  expect(totalTabs([])).toBe(0);
});

test('totalTabs handles session with no tabs property', () => {
  expect(totalTabs([{ name: 'empty' }])).toBe(0);
});

test('nonEmptySessions counts only sessions with tabs', () => {
  const mixed = [...sessions, { name: 'ghost', tabs: [] }];
  expect(nonEmptySessions(mixed)).toBe(3);
});

test('nonEmptySessions returns 0 for empty list', () => {
  expect(nonEmptySessions([])).toBe(0);
});

test('averageTabCount computes correctly', () => {
  expect(averageTabCount(sessions)).toBeCloseTo(16 / 3);
});

test('averageTabCount returns 0 for empty list', () => {
  expect(averageTabCount([])).toBe(0);
});

test('tabCountBreakdown returns per-session counts', () => {
  const result = tabCountBreakdown(sessions);
  expect(result).toEqual([
    { name: 'work', tabCount: 5 },
    { name: 'personal', tabCount: 3 },
    { name: 'research', tabCount: 8 },
  ]);
});

test('largestSession returns session with most tabs', () => {
  expect(largestSession(sessions).name).toBe('research');
});

test('largestSession returns null for empty list', () => {
  expect(largestSession([])).toBeNull();
});

test('formatCountSummary includes key stats', () => {
  const out = formatCountSummary(sessions);
  expect(out).toContain('Sessions : 3');
  expect(out).toContain('Total tabs: 16');
  expect(out).toContain('research');
});

test('formatCountSummary handles empty sessions', () => {
  const out = formatCountSummary([]);
  expect(out).toContain('Sessions : 0');
  expect(out).toContain('Total tabs: 0');
});
