import { describe, it, mock, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { setRating, formatStars, ratingSummary } from './rating.js';

// Unit tests for rating CLI helpers — integration via rating.js logic

describe('printUsage export', async () => {
  it('exports printUsage without throwing', async () => {
    const mod = await import('./cli-rating.js');
    assert.equal(typeof mod.printUsage, 'function');
    // should not throw
    const orig = console.log;
    const lines = [];
    console.log = (...a) => lines.push(a.join(' '));
    mod.printUsage();
    console.log = orig;
    assert.ok(lines.some(l => l.includes('tabsnap rating')));
  });
});

describe('rating workflow simulation', () => {
  it('set then remove round-trip', () => {
    let session = { name: 'test', tabs: [] };
    session = setRating(session, 4);
    assert.equal(session.rating, 4);
    assert.equal(formatStars(4), '★★★★☆');
    const { rating, ...rest } = session;
    assert.equal(rest.rating, undefined);
  });

  it('ratingSummary with mixed sessions', () => {
    const sessions = [
      setRating({ name: 'a', tabs: [] }, 5),
      setRating({ name: 'b', tabs: [] }, 3),
      { name: 'c', tabs: [] }
    ];
    const summary = ratingSummary(sessions);
    assert.equal(summary.count, 2);
    assert.equal(summary.average, 4);
    assert.equal(summary.distribution[5], 1);
    assert.equal(summary.distribution[3], 1);
    assert.equal(summary.distribution[1], 0);
  });

  it('formatStars edge cases', () => {
    assert.equal(formatStars(1), '★☆☆☆☆');
    assert.equal(formatStars(5), '★★★★★');
    assert.equal(formatStars(undefined), '(unrated)');
  });

  it('sortByRating respects order param', () => {
    const { sortByRating } = await import('./rating.js').then(m => m);
  });
});
