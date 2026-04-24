import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getProfileSessions,
  listProfiles,
  assignProfile,
  removeProfile,
  profileSummary,
  formatProfileReport,
} from './profile.js';

const sessions = [
  { name: 'work-a', profile: 'work', tabs: [{ url: 'https://a.com' }] },
  { name: 'work-b', profile: 'work', tabs: [{ url: 'https://b.com' }, { url: 'https://c.com' }] },
  { name: 'personal', profile: 'home', tabs: [{ url: 'https://d.com' }] },
  { name: 'misc' },
];

describe('getProfileSessions', () => {
  it('returns sessions matching profile', () => {
    const result = getProfileSessions(sessions, 'work');
    assert.equal(result.length, 2);
  });
  it('returns empty for unknown profile', () => {
    assert.deepEqual(getProfileSessions(sessions, 'nope'), []);
  });
});

describe('listProfiles', () => {
  it('lists unique profiles sorted', () => {
    assert.deepEqual(listProfiles(sessions), ['home', 'work']);
  });
  it('ignores sessions without profile', () => {
    assert.ok(!listProfiles(sessions).includes(undefined));
  });
});

describe('assignProfile', () => {
  it('adds profile to session', () => {
    const s = assignProfile({ name: 'x' }, 'dev');
    assert.equal(s.profile, 'dev');
  });
  it('throws on empty name', () => {
    assert.throws(() => assignProfile({}, ''));
  });
});

describe('removeProfile', () => {
  it('removes profile field', () => {
    const s = removeProfile({ name: 'x', profile: 'work' });
    assert.ok(!('profile' in s));
  });
});

describe('profileSummary', () => {
  it('counts sessions and tabs', () => {
    const s = profileSummary(sessions, 'work');
    assert.equal(s.sessionCount, 2);
    assert.equal(s.totalTabs, 3);
  });
});

describe('formatProfileReport', () => {
  it('returns a string', () => {
    const s = profileSummary(sessions, 'work');
    const r = formatProfileReport(s);
    assert.ok(r.includes('work'));
    assert.ok(r.includes('work-a'));
  });
});
