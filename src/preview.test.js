const { previewSession, previewSummaryLine } = require('./preview');

const baseSession = {
  name: 'work-morning',
  savedAt: '2024-06-01T09:00:00.000Z',
  browser: 'chrome',
  tags: ['work', 'daily'],
  notes: 'Morning research tabs',
  tabs: [
    { title: 'GitHub', url: 'https://github.com' },
    { title: 'Notion', url: 'https://notion.so' },
    { title: 'Slack', url: 'https://app.slack.com' },
  ],
};

test('previewSession includes session name', () => {
  const out = previewSession(baseSession, { color: false });
  expect(out).toContain('work-morning');
});

test('previewSession includes tab titles', () => {
  const out = previewSession(baseSession, { color: false });
  expect(out).toContain('GitHub');
  expect(out).toContain('Notion');
});

test('previewSession includes tab urls', () => {
  const out = previewSession(baseSession, { color: false });
  expect(out).toContain('https://github.com');
});

test('previewSession shows tags', () => {
  const out = previewSession(baseSession, { color: false });
  expect(out).toContain('#work');
  expect(out).toContain('#daily');
});

test('previewSession shows notes', () => {
  const out = previewSession(baseSession, { color: false });
  expect(out).toContain('Morning research tabs');
});

test('previewSession limits tabs via maxTabs', () => {
  const session = {
    ...baseSession,
    tabs: Array.from({ length: 15 }, (_, i) => ({ title: `Tab ${i}`, url: `https://example.com/${i}` })),
  };
  const out = previewSession(session, { maxTabs: 5, color: false });
  expect(out).toContain('10 more tabs');
});

test('previewSession handles session with no tabs', () => {
  const out = previewSession({ name: 'empty', tabs: [] }, { color: false });
  expect(out).toContain('empty');
  expect(out).not.toContain('more tab');
});

test('previewSession handles missing optional fields', () => {
  const out = previewSession({ name: 'bare', tabs: [{ title: 'X', url: 'https://x.com' }] }, { color: false });
  expect(out).toContain('bare');
});

test('previewSummaryLine returns single line', () => {
  const line = previewSummaryLine(baseSession, false);
  expect(line).toContain('work-morning');
  expect(line).toContain('chrome');
  expect(line.split('\n').length).toBe(1);
});

test('previewSummaryLine pads name field', () => {
  const line = previewSummaryLine({ name: 'x', tabs: [], browser: 'firefox' }, false);
  expect(line.startsWith('x')).toBe(true);
});
