const {
  markFavorite,
  unmarkFavorite,
  isFavorite,
  filterFavorites,
  filterNonFavorites,
  listFavorites,
} = require('./favorite');

const session = (name, fav) => ({ name, tabs: [], ...(fav ? { favorite: true } : {}) });

test('markFavorite sets favorite flag', () => {
  const s = markFavorite(session('work'));
  expect(s.favorite).toBe(true);
});

test('markFavorite does not mutate original', () => {
  const orig = session('work');
  markFavorite(orig);
  expect(orig.favorite).toBeUndefined();
});

test('unmarkFavorite removes favorite flag', () => {
  const s = unmarkFavorite(session('work', true));
  expect(s.favorite).toBeUndefined();
});

test('isFavorite returns true for favorited session', () => {
  expect(isFavorite(session('a', true))).toBe(true);
});

test('isFavorite returns false for normal session', () => {
  expect(isFavorite(session('a'))).toBe(false);
});

test('filterFavorites returns only favorites', () => {
  const sessions = [session('a', true), session('b'), session('c', true)];
  expect(filterFavorites(sessions).map(s => s.name)).toEqual(['a', 'c']);
});

test('filterNonFavorites excludes favorites', () => {
  const sessions = [session('a', true), session('b'), session('c')];
  expect(filterNonFavorites(sessions).map(s => s.name)).toEqual(['b', 'c']);
});

test('listFavorites returns names', () => {
  const sessions = [session('x', true), session('y', true), session('z')];
  expect(listFavorites(sessions)).toEqual(['x', 'y']);
});
