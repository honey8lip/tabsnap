const { diffSessions, formatDiff, diffSummary } = require('./diff');

const sessionA = {
  name: 'a',
  tabs: [
    { url: 'https://example.com', title: 'Example' },
    { url: 'https://github.com', title: 'GitHub' },
    { url: 'https://old.com', title: 'Old Site' },
  ],
};

const sessionB = {
  name: 'b',
  tabs: [
    { url: 'https://example.com', title: 'Example' },
    { url: 'https://github.com', title: 'GitHub' },
    { url: 'https://new.com', title: 'New Site' },
  ],
};

test('diffSessions finds added tabs', () => {
  const diff = diffSessions(sessionA, sessionB);
  expect(diff.added).toHaveLength(1);
  expect(diff.added[0].url).toBe('https://new.com');
});

test('diffSessions finds removed tabs', () => {
  const diff = diffSessions(sessionA, sessionB);
  expect(diff.removed).toHaveLength(1);
  expect(diff.removed[0].url).toBe('https://old.com');
});

test('diffSessions finds kept tabs', () => {
  const diff = diffSessions(sessionA, sessionB);
  expect(diff.kept).toHaveLength(2);
});

test('diffSessions with identical sessions returns no changes', () => {
  const diff = diffSessions(sessionA, sessionA);
  expect(diff.added).toHaveLength(0);
  expect(diff.removed).toHaveLength(0);
  expect(diff.kept).toHaveLength(3);
});

test('formatDiff includes added and removed labels', () => {
  const diff = diffSessions(sessionA, sessionB);
  const out = formatDiff(diff, { color: false });
  expect(out).toContain('+ New Site');
  expect(out).toContain('- Old Site');
  expect(out).toContain('1 added, 1 removed, 2 unchanged');
});

test('formatDiff with no changes shows message', () => {
  const diff = diffSessions(sessionA, sessionA);
  const out = formatDiff(diff, { color: false });
  expect(out).toContain('No differences found.');
});

test('diffSummary reflects counts', () => {
  const diff = diffSessions(sessionA, sessionB);
  const summary = diffSummary(diff);
  expect(summary.added).toBe(1);
  expect(summary.removed).toBe(1);
  expect(summary.kept).toBe(2);
  expect(summary.changed).toBe(true);
});
