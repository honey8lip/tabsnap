const path = require('path');
const os = require('os');
const fs = require('fs/promises');
const { renameSession } = require('./rename');
const { saveSession, listSessions } = require('./storage');

let tmpDir;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tabsnap-rename-'));
});

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

const sampleSession = {
  name: 'work',
  savedAt: '2024-01-01T00:00:00.000Z',
  tabs: [{ title: 'GitHub', url: 'https://github.com' }]
};

test('renames a session successfully', async () => {
  await saveSession(tmpDir, 'work', sampleSession);
  const result = await renameSession(tmpDir, 'work', 'work-backup');
  expect(result.name).toBe('work-backup');
  expect(result.renamedAt).toBeDefined();
  const sessions = await listSessions(tmpDir);
  expect(sessions).toContain('work-backup');
  expect(sessions).not.toContain('work');
});

test('throws if old name does not exist', async () => {
  await expect(renameSession(tmpDir, 'ghost', 'new')).rejects.toThrow('not found');
});

test('throws if new name already exists', async () => {
  await saveSession(tmpDir, 'work', sampleSession);
  await saveSession(tmpDir, 'personal', { ...sampleSession, name: 'personal' });
  await expect(renameSession(tmpDir, 'work', 'personal')).rejects.toThrow('already exists');
});

test('throws if names are the same', async () => {
  await saveSession(tmpDir, 'work', sampleSession);
  await expect(renameSession(tmpDir, 'work', 'work')).rejects.toThrow('must differ');
});

test('throws if names are missing', async () => {
  await expect(renameSession(tmpDir, '', 'new')).rejects.toThrow('required');
});
