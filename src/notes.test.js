const { addNote, removeNote, getNotes, formatNotes } = require('./notes');
const { saveSession, loadSession } = require('./storage');
const os = require('os');
const path = require('path');
const fs = require('fs/promises');

let tmpDir;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tabsnap-notes-'));
  await saveSession('work', { name: 'work', tabs: [], notes: [] }, tmpDir);
});

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

test('addNote appends a note with timestamp', async () => {
  const session = await addNote('work', 'remember to close slack', tmpDir);
  expect(session.notes).toHaveLength(1);
  expect(session.notes[0].text).toBe('remember to close slack');
  expect(session.notes[0].createdAt).toBeTruthy();
});

test('addNote persists across loads', async () => {
  await addNote('work', 'first note', tmpDir);
  const notes = await getNotes('work', tmpDir);
  expect(notes).toHaveLength(1);
  expect(notes[0].text).toBe('first note');
});

test('removeNote removes by index', async () => {
  await addNote('work', 'note a', tmpDir);
  await addNote('work', 'note b', tmpDir);
  const removed = await removeNote('work', 0, tmpDir);
  expect(removed.text).toBe('note a');
  const notes = await getNotes('work', tmpDir);
  expect(notes).toHaveLength(1);
  expect(notes[0].text).toBe('note b');
});

test('removeNote throws on bad index', async () => {
  await expect(removeNote('work', 5, tmpDir)).rejects.toThrow('out of range');
});

test('addNote throws if session missing', async () => {
  await expect(addNote('ghost', 'hi', tmpDir)).rejects.toThrow("Session 'ghost' not found");
});

test('formatNotes returns placeholder when empty', () => {
  expect(formatNotes([])).toBe('  (no notes)');
});

test('formatNotes lists notes with index', () => {
  const notes = [{ text: 'hello', createdAt: '2024-01-01T00:00:00.000Z' }];
  const out = formatNotes(notes);
  expect(out).toContain('[0]');
  expect(out).toContain('hello');
});
