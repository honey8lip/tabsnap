import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  setRating, removeRating, getRating, hasRating,
  filterByMinRating, filterRated, filterUnrated,
  sortByRating, formatStars, ratingSummary
} from './rating.js';

const base = { name: 'work', tabs: [] };

describe('setRating', () => {
  it('sets a valid rating', () => {
    const s = setRating(base, 4);
    assert.equal(s.rating, 4);
  });
  it('throws for out-of-range rating', () => {
    assert.throws(() => setRating(base, 6), /between 1 and 5/);
    assert.throws(() => setRating(base, 0), /between 1 and 5/);
  });
  it('throws for non-integer', () => {
    assert.throws(() => setRating(base, 3.5), /between 1 and 5/);
  });
});

describe('removeRating / getRating / hasRating', () => {
  it('removes rating', () => {
    const s = removeRating(setRating(base, 3));
    assert.equal(s.rating, undefined);
  });
  it('getRating returns null when unset', () => {
    assert.equal(getRating(base), null);
  });
  it('hasRating detects presence', () => {
    assert.ok(hasRating(setRating(base, 2)));
    assert.ok(!hasRating(base));
  });
});

describe('filter helpers', () => {
  const sessions = [
    { name: 'a', rating: 5 },
    { name: 'b', rating: 2 },
    { name: 'c' }
  ];
  it('filterByMinRating', () => {
    assert.equal(filterByMinRating(sessions, 3).length, 1);
  });
  it('filterRated', () => {
    assert.equal(filterRated(sessions).length, 2);
  });
  it('filterUnrated', () => {
    assert.equal(filterUnrated(sessions).length, 1);
  });
});

describe('sortByRating', () => {
  const sessions = [{ rating: 2 }, { rating: 5 }, { rating: 3 }];
  it('sorts desc by default', () => {
    const sorted = sortByRating(sessions);
    assert.equal(sorted[0].rating, 5);
  });
  it('sorts asc', () => {
    const sorted = sortByRating(sessions, 'asc');
    assert.equal(sorted[0].rating, 2);
  });
});

describe('formatStars', () => {
  it('formats 3 stars', () => assert.equal(formatStars(3), '★★★☆☆'));
  it('formats unrated', () => assert.equal(formatStars(null), '(unrated)'));
});

describe('ratingSummary', () => {
  it('returns nulls for empty', () => {
    const s = ratingSummary([]);
    assert.equal(s.average, null);
  });
  it('calculates average', () => {
    const s = ratingSummary([{ rating: 4 }, { rating: 2 }]);
    assert.equal(s.average, 3);
    assert.equal(s.count, 2);
  });
});
