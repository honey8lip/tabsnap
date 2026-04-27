import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  setLabel, removeLabel, getLabel, hasLabel,
  filterLabeled, filterByLabel, listLabels
} from './label.js';

const base = { name: 'work', tabs: [], savedAt: '2024-01-01T00:00:00Z' };

describe('setLabel', () => {
  it('sets a label on a session', () => {
    const s = setLabel(base, 'important');
    assert.equal(s.label, 'important');
  });

  it('trims whitespace', () => {
    const s = setLabel(base, '  focus  ');
    assert.equal(s.label, 'focus');
  });

  it('replaces an existing label', () => {
    const s = setLabel({ ...base, label: 'old' }, 'new');
    assert.equal(s.label, 'new');
  });

  it('throws on empty string', () => {
    assert.throws(() => setLabel(base, ''), /non-empty/);
  });

  it('throws on label longer than 64 chars', () => {
    assert.throws(() => setLabel(base, 'a'.repeat(65)), /64 characters/);
  });

  it('does not mutate original session', () => {
    setLabel(base, 'x');
    assert.equal(base.label, undefined);
  });
});

describe('removeLabel', () => {
  it('removes the label from a session', () => {
    const s = removeLabel({ ...base, label: 'foo' });
    assert.equal(s.label, undefined);
  });

  it('is safe when no label exists', () => {
    const s = removeLabel(base);
    assert.equal(s.label, undefined);
  });
});

describe('getLabel', () => {
  it('returns label string when present', () => {
    assert.equal(getLabel({ ...base, label: 'hi' }), 'hi');
  });

  it('returns null when absent', () => {
    assert.equal(getLabel(base), null);
  });
});

describe('hasLabel', () => {
  it('true when label present', () => assert.ok(hasLabel({ ...base, label: 'x' })));
  it('false when label absent', () => assert.ok(!hasLabel(base)));
});

describe('filterLabeled', () => {
  it('returns only sessions with labels', () => {
    const sessions = [base, { ...base, label: 'a' }, { ...base, label: 'b' }];
    assert.equal(filterLabeled(sessions).length, 2);
  });
});

describe('filterByLabel', () => {
  it('matches case-insensitively', () => {
    const sessions = [{ ...base, label: 'Work' }, { ...base, label: 'home' }];
    const result = filterByLabel(sessions, 'WORK');
    assert.equal(result.length, 1);
    assert.equal(result[0].label, 'Work');
  });
});

describe('listLabels', () => {
  it('returns sorted unique labels', () => {
    const sessions = [
      { ...base, label: 'zebra' },
      { ...base, label: 'apple' },
      { ...base, label: 'zebra' },
      base
    ];
    assert.deepEqual(listLabels(sessions), ['apple', 'zebra']);
  });

  it('returns empty array when no labels', () => {
    assert.deepEqual(listLabels([base]), []);
  });
});
