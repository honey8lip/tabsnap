const { addTags, removeTags, filterByTag, listAllTags } = require('./tag');

const base = { name: 'work', tabs: [], tags: ['dev'] };

test('addTags merges and deduplicates', () => {
  const result = addTags(base, ['Dev', 'design']);
  expect(result.tags).toEqual(['dev', 'design']);
});

test('addTags works with no existing tags', () => {
  const s = { name: 'empty', tabs: [] };
  const result = addTags(s, ['foo']);
  expect(result.tags).toEqual(['foo']);
});

test('removeTags removes specified tags', () => {
  const s = { ...base, tags: ['dev', 'design'] };
  const result = removeTags(s, ['DEV']);
  expect(result.tags).toEqual(['design']);
});

test('removeTags handles missing tags gracefully', () => {
  const result = removeTags(base, ['nonexistent']);
  expect(result.tags).toEqual(['dev']);
});

test('filterByTag returns matching sessions', () => {
  const sessions = [
    { name: 'a', tags: ['dev'] },
    { name: 'b', tags: ['design'] },
    { name: 'c', tags: ['dev', 'design'] },
  ];
  expect(filterByTag(sessions, 'dev').map(s => s.name)).toEqual(['a', 'c']);
});

test('filterByTag returns empty if none match', () => {
  expect(filterByTag([base], 'nope')).toEqual([]);
});

test('listAllTags returns sorted unique tags', () => {
  const sessions = [
    { tags: ['work', 'dev'] },
    { tags: ['dev', 'personal'] },
  ];
  expect(listAllTags(sessions)).toEqual(['dev', 'personal', 'work']);
});

test('listAllTags handles sessions without tags', () => {
  expect(listAllTags([{ name: 'x' }])).toEqual([]);
});
