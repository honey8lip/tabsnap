import {
  setAnnotation, removeAnnotation, getAnnotation,
  hasAnnotation, listAnnotations, clearAnnotations,
  filterByAnnotation, formatAnnotations
} from './annotate.js';

const base = { name: 'work', tabs: [] };

test('setAnnotation adds key/value to session', () => {
  const s = setAnnotation(base, 'note', 'important');
  expect(s.annotations.note).toBe('important');
});

test('setAnnotation preserves existing annotations', () => {
  const s1 = setAnnotation(base, 'a', '1');
  const s2 = setAnnotation(s1, 'b', '2');
  expect(s2.annotations.a).toBe('1');
  expect(s2.annotations.b).toBe('2');
});

test('setAnnotation throws on invalid key', () => {
  expect(() => setAnnotation(base, '', 'val')).toThrow();
  expect(() => setAnnotation(null, 'key', 'val')).toThrow();
});

test('removeAnnotation removes the key', () => {
  const s = setAnnotation(base, 'note', 'hi');
  const r = removeAnnotation(s, 'note');
  expect(r.annotations.note).toBeUndefined();
});

test('removeAnnotation is safe on missing annotations', () => {
  const r = removeAnnotation(base, 'note');
  expect(r).toEqual(base);
});

test('getAnnotation returns value or null', () => {
  const s = setAnnotation(base, 'x', 42);
  expect(getAnnotation(s, 'x')).toBe(42);
  expect(getAnnotation(s, 'missing')).toBeNull();
});

test('hasAnnotation returns boolean', () => {
  const s = setAnnotation(base, 'flag', true);
  expect(hasAnnotation(s, 'flag')).toBe(true);
  expect(hasAnnotation(s, 'nope')).toBe(false);
});

test('listAnnotations returns array of entries', () => {
  const s = setAnnotation(setAnnotation(base, 'a', '1'), 'b', '2');
  const list = listAnnotations(s);
  expect(list).toHaveLength(2);
  expect(list[0]).toHaveProperty('key');
  expect(list[0]).toHaveProperty('value');
});

test('clearAnnotations removes all annotations', () => {
  const s = setAnnotation(base, 'note', 'hi');
  const r = clearAnnotations(s);
  expect(r.annotations).toBeUndefined();
});

test('filterByAnnotation filters by key presence', () => {
  const s1 = setAnnotation({ name: 'a', tabs: [] }, 'env', 'prod');
  const s2 = setAnnotation({ name: 'b', tabs: [] }, 'env', 'dev');
  const s3 = { name: 'c', tabs: [] };
  const result = filterByAnnotation([s1, s2, s3], 'env');
  expect(result).toHaveLength(2);
});

test('filterByAnnotation filters by key and value', () => {
  const s1 = setAnnotation({ name: 'a', tabs: [] }, 'env', 'prod');
  const s2 = setAnnotation({ name: 'b', tabs: [] }, 'env', 'dev');
  const result = filterByAnnotation([s1, s2], 'env', 'prod');
  expect(result).toHaveLength(1);
  expect(result[0].name).toBe('a');
});

test('formatAnnotations formats nicely', () => {
  const s = setAnnotation(base, 'note', 'hello');
  const out = formatAnnotations(s);
  expect(out).toContain('note');
  expect(out).toContain('hello');
});

test('formatAnnotations handles empty', () => {
  expect(formatAnnotations(base)).toBe('(no annotations)');
});
