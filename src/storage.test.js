const fs = require('fs');
const path = require('path');
const os = require('os');
const { saveSession, loadSession, listSessions, deleteSession } = require('./storage');

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tabsnap-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('saveSession writes a json file', () => {
  const tabs = [{ title: 'Google', url: 'https://google.com' }];
  const filePath = saveSession('work', tabs, tmpDir);
  expect(fs.existsSync(filePath)).toBe(true);
});

test('loadSession returns saved session data', () => {
  const tabs = [{ title: 'GitHub', url: 'https://github.com' }];
  saveSession('dev', tabs, tmpDir);
  const session = loadSession('dev', tmpDir);
  expect(session.name).toBe('dev');
  expect(session.tabs).toEqual(tabs);
  expect(session.savedAt).toBeDefined();
});

test('loadSession throws if session does not exist', () => {
  expect(() => loadSession('nope', tmpDir)).toThrow('Session "nope" not found.');
});

test('listSessions returns all saved session names', () => {
  saveSession('alpha', [], tmpDir);
  saveSession('beta', [], tmpDir);
  const sessions = listSessions(tmpDir);
  expect(sessions).toContain('alpha');
  expect(sessions).toContain('beta');
});

test('deleteSession removes the session file', () => {
  saveSession('temp', [], tmpDir);
  deleteSession('temp', tmpDir);
  expect(listSessions(tmpDir)).not.toContain('temp');
});

test('deleteSession throws if session does not exist', () => {
  expect(() => deleteSession('ghost', tmpDir)).toThrow('Session "ghost" not found.');
});
