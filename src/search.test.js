import { searchTabs, searchSessions, formatSearchResults } from './search.js';

const session1 = {
  name: 'work',
  tabs: [
    { url: 'https://github.com/foo', title: 'GitHub Foo' },
    { url: 'https://docs.example.com', title: 'Docs' },
  ],
};

const session2 = {
  name: 'personal',
  tabs: [
    { url: 'https://github.com/bar', title: 'GitHub Bar' },
    { url: 'https://news.ycombinator.com', title: 'Hacker News' },
  ],
};

test('searchTabs returns matching tabs by url', () => {
  const results = searchTabs(session1, 'github');
  expect(results).toHaveLength(1);
  expect(results[0].url).toContain('github');
});

test('searchTabs returns matching tabs by title', () => {
  const results = searchTabs(session1, 'docs');
  expect(results).toHaveLength(1);
});

test('searchTabs returns empty when no match', () => {
  expect(searchTabs(session1, 'zzznomatch')).toHaveLength(0);
});

test('searchSessions finds across multiple sessions', () => {
  const results = searchSessions([session1, session2], 'github');
  expect(results).toHaveLength(2);
});

test('searchSessions excludes sessions with no matches', () => {
  const results = searchSessions([session1, session2], 'hacker');
  expect(results).toHaveLength(1);
  expect(results[0].name).toBe('personal');
});

test('formatSearchResults shows no results message', () => {
  const out = formatSearchResults([], 'foo');
  expect(out).toMatch(/No sessions found/);
});

test('formatSearchResults lists matched tabs', () => {
  const results = searchSessions([session1, session2], 'github');
  const out = formatSearchResults(results, 'github');
  expect(out).toMatch('GitHub Foo');
  expect(out).toMatch('GitHub Bar');
});
