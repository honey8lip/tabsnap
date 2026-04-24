const { addTags, removeTags, filterByTag, listAllTags } = require('./tag');

// Integration-style tests for tag CLI logic

test('addTags then removeTags round-trip', () => {
  let session = { name: 'test', tabs: [] };
  session = addTags(session, ['alpha', 'beta']);
  session = removeTags(session, ['alpha']);
  expect(session.tags).toEqual(['beta']);
});

test('filterByTag works after addTags', () => {
  let s1 = addTags({ name: 's1', tabs: [] }, ['work']);
  let s2 = addTags({ name: 's2', tabs: [] }, ['personal']);
  const results = filterByTag([s1, s2], 'work');
  expect(results).toHaveLength(1);
  expect(results[0].name).toBe('s1');
});

test('listAllTags reflects added tags', () => {
  const s1 = addTags({ name: 'a', tabs: [] }, ['foo', 'bar']);
  const s2 = addTags({ name: 'b', tabs: [] }, ['bar', 'baz']);
  expect(listAllTags([s1, s2])).toEqual(['bar', 'baz', 'foo']);
});

test('empty tag strings are ignored', () => {
  const s = addTags({ name: 'x', tabs: [] }, ['', '  ', 'valid']);
  expect(s.tags).toEqual(['valid']);
});

test('removeTags on non-existent tag leaves tags unchanged', () => {
  let session = addTags({ name: 'test', tabs: [] }, ['alpha', 'beta']);
  session = removeTags(session, ['gamma']);
  expect(session.tags).toEqual(['alpha', 'beta']);
});

test('filterByTag returns empty array when no sessions match', () => {
  const s1 = addTags({ name: 's1', tabs: [] }, ['work']);
  const results = filterByTag([s1], 'personal');
  expect(results).toEqual([]);
});
