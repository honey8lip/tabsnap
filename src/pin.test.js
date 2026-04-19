const { pinSession, unpinSession, isPinned, filterPinned, filterUnpinned, listPinned } = require('./pin');

const makeSession = (name, pinned) => ({
  name,
  date: '2024-01-01',
  tabs: [],
  ...(pinned ? { pinned: true } : {}),
});

test('pinSession sets pinned true', () => {
  const s = makeSession('work');
  expect(isPinned(pinSession(s))).toBe(true);
});

test('unpinSession removes pinned flag', () => {
  const s = pinSession(makeSession('work'));
  const u = unpinSession(s);
  expect(u.pinned).toBeUndefined();
});

test('isPinned returns false for normal session', () => {
  expect(isPinned(makeSession('plain'))).toBe(false);
});

test('filterPinned returns only pinned sessions', () => {
  const sessions = [makeSession('a', true), makeSession('b'), makeSession('c', true)];
  const result = filterPinned(sessions);
  expect(result).toHaveLength(2);
  expect(result.map(s => s.name)).toEqual(['a', 'c']);
});

test('filterUnpinned excludes pinned sessions', () => {
  const sessions = [makeSession('a', true), makeSession('b'), makeSession('c')];
  const result = filterUnpinned(sessions);
  expect(result).toHaveLength(2);
  expect(result.map(s => s.name)).toEqual(['b', 'c']);
});

test('listPinned returns names of pinned sessions', () => {
  const sessions = [makeSession('x', true), makeSession('y'), makeSession('z', true)];
  expect(listPinned(sessions)).toEqual(['x', 'z']);
});

test('pinSession does not mutate original', () => {
  const s = makeSession('orig');
  pinSession(s);
  expect(s.pinned).toBeUndefined();
});
