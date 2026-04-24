const { formatDate, formatTabCount, formatSessionLine, formatTabLine, formatSessionDetail, formatList } = require('./format');

const mockSession = {
  name: 'work',
  browser: 'chrome',
  savedAt: '2024-06-01T10:30:00.000Z',
  tags: ['dev', 'research'],
  notes: 'daily tabs',
  tabs: [
    { title: 'GitHub', url: 'https://github.com' },
    { title: 'MDN', url: 'https://developer.mozilla.org' }
  ]
};

test('formatTabCount singular', () => {
  expect(formatTabCount(1)).toBe('1 tab');
});

test('formatTabCount plural', () => {
  expect(formatTabCount(5)).toBe('5 tabs');
});

test('formatTabCount zero', () => {
  expect(formatTabCount(0)).toBe('0 tabs');
});

test('formatDate returns string for valid iso', () => {
  const result = formatDate('2024-06-01T10:30:00.000Z');
  expect(typeof result).toBe('string');
  expect(result.length).toBeGreaterThan(0);
});

test('formatDate returns unknown for null', () => {
  expect(formatDate(null)).toBe('unknown');
});

test('formatSessionLine includes name and tab count', () => {
  const line = formatSessionLine(mockSession);
  expect(line).toContain('work');
  expect(line).toContain('2 tabs');
});

test('formatSessionLine shows browser by default', () => {
  const line = formatSessionLine(mockSession);
  expect(line).toContain('[chrome]');
});

test('formatSessionLine hides browser when showBrowser false', () => {
  const line = formatSessionLine(mockSession, { showBrowser: false });
  expect(line).not.toContain('[chrome]');
});

test('formatSessionLine shows tags when showTags true', () => {
  const line = formatSessionLine(mockSession, { showTags: true });
  expect(line).toContain('#dev');
  expect(line).toContain('#research');
});

test('formatTabLine includes title and url', () => {
  const line = formatTabLine({ title: 'GitHub', url: 'https://github.com' }, 0);
  expect(line).toContain('GitHub');
  expect(line).toContain('https://github.com');
  expect(line).toContain('1.');
});

test('formatTabLine handles missing title', () => {
  const line = formatTabLine({ url: 'https://example.com' });
  expect(line).toContain('(no title)');
});

test('formatSessionDetail includes all fields', () => {
  const detail = formatSessionDetail(mockSession);
  expect(detail).toContain('work');
  expect(detail).toContain('chrome');
  expect(detail).toContain('dev, research');
  expect(detail).toContain('daily tabs');
  expect(detail).toContain('GitHub');
});

test('formatList returns no sessions message when empty', () => {
  expect(formatList([])).toBe('(no sessions)');
  expect(formatList(null)).toBe('(no sessions)');
});

test('formatList returns one line per session', () => {
  const result = formatList([mockSession, { ...mockSession, name: 'personal', tabs: [] }]);
  const lines = result.split('\n');
  expect(lines).toHaveLength(2);
  expect(lines[0]).toContain('work');
  expect(lines[1]).toContain('personal');
});
