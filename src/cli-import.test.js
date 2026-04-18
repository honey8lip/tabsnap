'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { loadSession, deleteSession } = require('./storage');

const FIXTURES_DIR = path.join(__dirname, '__fixtures__');

beforeAll(() => {
  if (!fs.existsSync(FIXTURES_DIR)) {
    fs.mkdirSync(FIXTURES_DIR, { recursive: true });
  }
});

afterAll(() => {
  fs.rmSync(FIXTURES_DIR, { recursive: true, force: true });
});

function writeFixture(name, content) {
  const p = path.join(FIXTURES_DIR, name);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

describe('cli-import', () => {
  it('imports html bookmark file', async () => {
    const html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<DL><p>
  <DT><A HREF="https://example.com" ADD_DATE="1">Example</A>
  <DT><A HREF="https://nodejs.org" ADD_DATE="2">Node.js</A>
</DL>`;
    const file = writeFixture('test-import.html', html);
    execSync(`node ${path.join(__dirname, 'cli-import.js')} ${file} test-html-session`, { stdio: 'pipe' });
    const session = await loadSession('test-html-session');
    expect(session.tabs.length).toBe(2);
    expect(session.browser).toBe('imported');
    expect(session.name).toBe('test-html-session');
    await deleteSession('test-html-session');
  });

  it('imports markdown file', async () => {
    const md = `# My Links
- [GitHub](https://github.com)
- [MDN](https://developer.mozilla.org)
- [NPM](https://npmjs.com)
`;
    const file = writeFixture('test-import.md', md);
    execSync(`node ${path.join(__dirname, 'cli-import.js')} ${file} test-md-session`, { stdio: 'pipe' });
    const session = await loadSession('test-md-session');
    expect(session.tabs.length).toBe(3);
    expect(session.tabs[0].url).toBe('https://github.com');
    await deleteSession('test-md-session');
  });

  it('uses filename as default session name', async () => {
    const md = `- [Example](https://example.com)`;
    const file = writeFixture('my-links.md', md);
    execSync(`node ${path.join(__dirname, 'cli-import.js')} ${file}`, { stdio: 'pipe' });
    const session = await loadSession('my-links');
    expect(session).toBeTruthy();
    await deleteSession('my-links');
  });

  it('exits with error for unsupported format', () => {
    const file = writeFixture('bad.txt', 'nothing');
    expect(() => {
      execSync(`node ${path.join(__dirname, 'cli-import.js')} ${file} bad`, { stdio: 'pipe' });
    }).toThrow();
  });
});
