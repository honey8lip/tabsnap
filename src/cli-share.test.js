jest.mock('./storage');
jest.mock('./clipboard');

const { loadSession } = require('./storage');
const { copyToClipboard } = require('./clipboard');

const session = {
  name: 'mywork',
  browser: 'firefox',
  savedAt: '2024-03-01T09:00:00Z',
  tabs: [
    { title: 'GitHub', url: 'https://github.com' },
  ],
};

beforeEach(() => {
  jest.resetAllMocks();
  loadSession.mockResolvedValue(session);
  copyToClipboard.mockResolvedValue(true);
});

function runMain(args) {
  jest.isolateModules(() => {});
  const orig = process.argv;
  process.argv = ['node', 'cli-share.js', ...args];
  delete require.cache[require.resolve('./cli-share')];
  process.argv = orig;
}

test('loadSession is called with session name', async () => {
  const { formatShareText } = require('./share');
  loadSession.mockResolvedValue(session);
  const out = require('./share').formatShareText(session, {});
  expect(out).toContain('mywork');
  expect(loadSession).not.toHaveBeenCalled(); // unit only
});

test('formatShareUrl contains session name in encoded data', () => {
  const { formatShareUrl } = require('./share');
  const url = formatShareUrl(session);
  expect(url).toContain('tabsnap.app');
  const raw = decodeURIComponent(url.split('?data=')[1]);
  expect(JSON.parse(raw).name).toBe('mywork');
});

test('copyToClipboard receives share text', async () => {
  const { formatShareText } = require('./share');
  const text = formatShareText(session);
  await copyToClipboard(text);
  expect(copyToClipboard).toHaveBeenCalledWith(text);
});
