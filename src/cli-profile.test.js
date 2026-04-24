import { describe, it, mock, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { assignProfile, removeProfile, listProfiles, profileSummary, formatProfileReport } from './profile.js';

// Unit tests for the profile CLI helpers via the underlying module
// (integration-style tests avoid spawning a child process)

describe('cli-profile helpers via profile module', () => {
  const sessions = [
    { name: 'alpha', profile: 'dev', tabs: [{ url: 'https://x.com' }] },
    { name: 'beta', profile: 'dev', tabs: [] },
    { name: 'gamma', profile: 'personal', tabs: [{ url: 'https://y.com' }] },
  ];

  it('list: finds both profiles', () => {
    const ps = listProfiles(sessions);
    assert.ok(ps.includes('dev'));
    assert.ok(ps.includes('personal'));
  });

  it('show: summary for dev profile', () => {
    const s = profileSummary(sessions, 'dev');
    assert.equal(s.sessionCount, 2);
    assert.equal(s.totalTabs, 1);
  });

  it('show: formatted report contains profile name', () => {
    const s = profileSummary(sessions, 'personal');
    const r = formatProfileReport(s);
    assert.ok(r.includes('personal'));
    assert.ok(r.includes('gamma'));
  });

  it('set: assignProfile returns updated session', () => {
    const updated = assignProfile({ name: 'delta', tabs: [] }, 'work');
    assert.equal(updated.profile, 'work');
    assert.equal(updated.name, 'delta');
  });

  it('set: trims whitespace from profile name', () => {
    const updated = assignProfile({ name: 'e' }, '  work  ');
    assert.equal(updated.profile, 'work');
  });

  it('unset: removeProfile does not mutate original', () => {
    const orig = { name: 'f', profile: 'dev' };
    const updated = removeProfile(orig);
    assert.ok('profile' in orig);
    assert.ok(!('profile' in updated));
  });

  it('set: throws for blank profile name', () => {
    assert.throws(() => assignProfile({}, '   '));
  });
});
