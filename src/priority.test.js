const {
  setPriority,
  removePriority,
  getPriority,
  sortByPriority,
  filterByPriority,
  filterAbovePriority,
  prioritySummary
} = require('./priority');

const makeSession = (name, priority) => ({ name, tabs: [], priority });

test('setPriority sets valid level', () => {
  const s = makeSession('work', undefined);
  expect(setPriority(s, 'high').priority).toBe('high');
});

test('setPriority throws on invalid level', () => {
  expect(() => setPriority(makeSession('x'), 'urgent')).toThrow('Invalid priority level');
});

test('removePriority strips the field', () => {
  const s = makeSession('work', 'high');
  expect(removePriority(s).priority).toBeUndefined();
});

test('getPriority returns normal as default', () => {
  expect(getPriority({ name: 'x', tabs: [] })).toBe('normal');
});

test('sortByPriority orders highest first', () => {
  const sessions = [
    makeSession('a', 'low'),
    makeSession('b', 'critical'),
    makeSession('c', 'normal')
  ];
  const sorted = sortByPriority(sessions);
  expect(sorted[0].name).toBe('b');
  expect(sorted[2].name).toBe('a');
});

test('filterByPriority returns only matching level', () => {
  const sessions = [makeSession('a', 'high'), makeSession('b', 'low'), makeSession('c', 'high')];
  expect(filterByPriority(sessions, 'high')).toHaveLength(2);
});

test('filterAbovePriority includes threshold and above', () => {
  const sessions = [
    makeSession('a', 'low'),
    makeSession('b', 'normal'),
    makeSession('c', 'high'),
    makeSession('d', 'critical')
  ];
  expect(filterAbovePriority(sessions, 'high')).toHaveLength(2);
});

test('prioritySummary counts all levels', () => {
  const sessions = [makeSession('a', 'high'), makeSession('b', 'high'), makeSession('c', 'low')];
  const summary = prioritySummary(sessions);
  expect(summary.high).toBe(2);
  expect(summary.low).toBe(1);
  expect(summary.normal).toBe(0);
  expect(summary.critical).toBe(0);
});
