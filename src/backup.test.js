import { describe, it, expect, vi, beforeEach } from 'vitest';
import { backupSession, listBackups, restoreBackup, pruneBackups, backupSummary } from './backup.js';

vi.mock('./storage.js', () => ({
  loadSession: vi.fn(),
  saveSession: vi.fn(),
  listSessions: vi.fn(),
}));

import { loadSession, saveSession, listSessions } from './storage.js';

beforeEach(() => vi.clearAllMocks());

describe('backupSession', () => {
  it('saves session with backup metadata', async () => {
    loadSession.mockResolvedValue({ tabs: [] });
    saveSession.mockResolvedValue();
    const name = await backupSession('work', '/backups');
    expect(name).toMatch(/^work_backup_/);
    expect(saveSession).toHaveBeenCalledWith(name, expect.objectContaining({ backupOf: 'work', tabs: [] }), '/backups');
  });
});

describe('listBackups', () => {
  it('filters sessions by backup prefix', async () => {
    listSessions.mockResolvedValue(['work_backup_2024', 'other', 'work_backup_2023']);
    const result = await listBackups('work', '/backups');
    expect(result).toEqual(['work_backup_2024', 'work_backup_2023']);
  });
});

describe('restoreBackup', () => {
  it('strips backup metadata when restoring', async () => {
    loadSession.mockResolvedValue({ tabs: [1], backupOf: 'work', backedUpAt: 'x' });
    saveSession.mockResolvedValue();
    const result = await restoreBackup('work_backup_x', 'work', '/backups', '/sessions');
    expect(result).toEqual({ tabs: [1] });
    expect(saveSession).toHaveBeenCalledWith('work', { tabs: [1] }, '/sessions');
  });
});

describe('backupSummary', () => {
  it('returns message when no backups', () => {
    expect(backupSummary([])).toBe('No backups found.');
  });
  it('lists backups', () => {
    expect(backupSummary(['a', 'b'])).toContain('1. a');
  });
});
