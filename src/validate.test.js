import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateSession, formatReport } from './validate.js';

const goodSession = {
  name: 'work',
  savedAt: '2024-06-01T10:00:00.000Z',
  browser: 'chrome',
  tabs: [
    { url: 'https://example.com', title: 'Example' },
    { url: 'https://github.com', title: 'GitHub' },
  ],
};

describe('validateSession', () => {
  it('returns no errors for a valid session', () => {
    const errors = validateSession(goodSession);
    assert.deepEqual(errors, []);
  });

  it('returns error for null session', () => {
    const errors = validateSession(null);
    assert.ok(errors.length > 0);
  });

  it('returns error for missing name', () => {
    const errors = validateSession({ ...goodSession, name: undefined });
    assert.ok(errors.some(e => e.includes('name')));
  });

  it('returns error for invalid savedAt', () => {
    const errors = validateSession({ ...goodSession, savedAt: 'not-a-date' });
    assert.ok(errors.some(e => e.includes('savedAt')));
  });

  it('returns error for non-array tabs', () => {
    const errors = validateSession({ ...goodSession, tabs: 'nope' });
    assert.ok(errors.some(e => e.includes('tabs')));
  });

  it('returns error for tab missing url', () => {
    const tabs = [{ title: 'No URL' }];
    const errors = validateSession({ ...goodSession, tabs });
    assert.ok(errors.some(e => e.includes('url')));
  });

  it('returns error for tab missing title', () => {
    const tabs = [{ url: 'https://example.com' }];
    const errors = validateSession({ ...goodSession, tabs });
    assert.ok(errors.some(e => e.includes('title')));
  });
});

describe('formatReport', () => {
  it('returns message when no sessions', () => {
    const out = formatReport([]);
    assert.ok(out.includes('No sessions'));
  });

  it('shows valid and invalid counts', () => {
    const report = [
      { name: 'good', valid: true, errors: [] },
      { name: 'bad', valid: false, errors: ['Missing field: name'] },
    ];
    const out = formatReport(report);
    assert.ok(out.includes('1/2'));
    assert.ok(out.includes('✓ good'));
    assert.ok(out.includes('✗ bad'));
    assert.ok(out.includes('Missing field: name'));
  });
});
