const { buildSharePayload, formatShareText, formatShareUrl, shareableSummary } = require('./share');

const session = {
  name: 'work',
  browser: 'chrome',
  savedAt: '2024-01-15T10:00:00Z',
  tabs: [
    { title: 'GitHub', url: 'https://github.com' },
    { title: 'MDN', url: 'https://developer.mozilla.org' },
  ],
};

test('buildSharePayload includes meta when options on', () => {
  const p = buildSharePayload(session);
  expect(p.name).toBe('work');
  expect(p.tabCount).toBe(2);
  expect(p.meta).toEqual(expect.arrayContaining(['Browser: chrome']));
});

test('buildSharePayload excludes meta when options off', () => {
  const p = buildSharePayload(session, { includeDate: false, includeBrowser: false });
  expect(p.meta).toHaveLength(0);
});

test('formatShareText starts with session name heading', () => {
  const text = formatShareText(session);
  expect(text).toMatch(/^# work/);
});

test('formatShareText includes tab urls', () => {
  const text = formatShareText(session);
  expect(text).toContain('https://github.com');
  expect(text).toContain('https://developer.mozilla.org');
});

test('formatShareUrl returns encoded url', () => {
  const url = formatShareUrl(session);
  expect(url).toMatch(/^https:\/\/tabsnap\.app\/share\?data=/);
  const data = JSON.parse(decodeURIComponent(url.split('?data=')[1]));
  expect(data.name).toBe('work');
  expect(data.tabs).toHaveLength(2);
});

test('shareableSummary formats correctly', () => {
  expect(shareableSummary(session)).toBe('work — 2 tabs');
  expect(shareableSummary({ name: 'solo', tabs: [{ url: 'x' }] })).toBe('solo — 1 tab');
});
