import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { archiveSession, unarchiveSession, listArchived, purgeArchive } from './archive.js';
import { saveSession } from './storage.js';

let tmpSessions, tmpArchive;

beforeEach(async () => {
  tmpSessions = await fs.mkdtemp(path.join(os.tmpdir(), 'tabsnap-sessions-'));
  tmpArchive = await fs.mkdtemp(path.join(os.tmpdir(), 'tabsnap-archive-'));
});

afterEach(async () => {
  await fs.rm(tmpSessions, { recursive: true, force: true });
  await fs.rm(tmpArchive, { recursive: true, force: true });
});

const sampleSession = { name: 'work', savedAt: '2024-01-01', tabs: [{ title: 'GitHub', url: 'https://github.com' }] };

describe('archiveSession', () => {
  it('moves session to archive dir', async () => {
    await saveSession('work', sampleSession, tmpSessions);
    const archivedName = await archiveSession('work', tmpSessions, tmpArchive);
    assert.match(archivedName, /^work_archived_\d+$/);
    const files = await fs.readdir(tmpArchive);
    assert.equal(files.length, 1);
    const remaining = await fs.readdir(tmpSessions);
    assert.equal(remaining.length, 0);
  });
});

describe('unarchiveSession', () => {
  it('restores session back to sessions dir', async () => {
    await saveSession('work', sampleSession, tmpSessions);
    const archivedName = await archiveSession('work', tmpSessions, tmpArchive);
    const restored = await unarchiveSession(archivedName, tmpArchive, tmpSessions);
    assert.equal(restored, 'work');
    const files = await fs.readdir(tmpSessions);
    assert.equal(files.length, 1);
  });
});

describe('purgeArchive', () => {
  it('deletes all archived sessions', async () => {
    await saveSession('work', sampleSession, tmpSessions);
    await archiveSession('work', tmpSessions, tmpArchive);
    const count = await purgeArchive(tmpArchive);
    assert.equal(count, 1);
    const files = await fs.readdir(tmpArchive);
    assert.equal(files.length, 0);
  });
});
