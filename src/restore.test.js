import { describe, it, expect, vi, beforeEach } from 'vitest';
import { restoreSession, openTabs } from './restore.js';
import * as storage from './storage.js';
import * as browser from './browser.js';
import * as child_process from 'child_process';
import { promisify } from 'util';

vi.mock('./storage.js');
vi.mock('./browser.js');
vi.mock('child_process', () => ({ exec: vi.fn() }));
vi.mock('util', () => ({ promisify: vi.fn(() => vi.fn().mockResolvedValue({ stdout: '' })) }));

const mockSession = {
  name: 'work',
  tabs: [
    { title: 'GitHub', url: 'https://github.com' },
    { title: 'Docs', url: 'https://docs.example.com' },
    { title: 'Empty', url: '' }
  ]
};

beforeEach(() => {
  vi.clearAllMocks();
  browser.detectBrowser.mockReturnValue({ name: 'chrome', appName: 'Google Chrome', bin: 'google-chrome' });
  browser.isRunning.mockResolvedValue(true);
  storage.loadSession.mockResolvedValue(mockSession);
});

describe('restoreSession', () => {
  it('restores all valid tabs from a session', async () => {
    const result = await restoreSession('work');
    expect(result.restored).toBe(2);
    expect(result.skipped).toBe(1);
  });

  it('throws if session not found', async () => {
    storage.loadSession.mockResolvedValue(null);
    await expect(restoreSession('missing')).rejects.toThrow('Session "missing" not found');
  });

  it('filters tabs by keyword when option provided', async () => {
    const result = await restoreSession('work', { filter: 'github' });
    expect(result.restored).toBe(1);
  });

  it('returns zero restored for empty session', async () => {
    storage.loadSession.mockResolvedValue({ name: 'empty', tabs: [] });
    const result = await restoreSession('empty');
    expect(result.restored).toBe(0);
  });
});
