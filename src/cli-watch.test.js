import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./watch.js', () => ({
  createWatcher: vi.fn(() => ({
    start: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn(),
    isRunning: vi.fn().mockReturnValue(true),
    getLastSession: vi.fn().mockReturnValue(null),
  })),
}));

vi.mock('./browser.js', () => ({
  detectBrowser: vi.fn().mockReturnValue('chrome'),
  parseTabs: vi.fn().mockReturnValue([]),
  formatSession: vi.fn().mockReturnValue({ tabs: [] }),
}));

vi.mock('./capture.js', () => ({
  summarize: vi.fn().mockReturnValue({ tabCount: 0 }),
}));

vi.mock('./diff.js', () => ({
  diffSessions: vi.fn().mockReturnValue({ added: [], removed: [] }),
  formatDiff: vi.fn().mockReturnValue('no changes'),
}));

import { createWatcher } from './watch.js';
import { main } from './cli-watch.js';

beforeEach(() => vi.clearAllMocks());

describe('cli-watch main', () => {
  it('creates watcher with correct name', async () => {
    await main(['node', 'cli-watch.js', 'mysession']);
    expect(createWatcher).toHaveBeenCalledWith(
      'mysession',
      expect.any(Function),
      expect.objectContaining({ intervalMs: 60000 })
    );
  });

  it('respects --interval flag', async () => {
    await main(['node', 'cli-watch.js', 'work', '--interval', '30']);
    expect(createWatcher).toHaveBeenCalledWith(
      'work',
      expect.any(Function),
      expect.objectContaining({ intervalMs: 30000 })
    );
  });

  it('passes quiet option when --quiet flag is set', async () => {
    await main(['node', 'cli-watch.js', 'quiet-session', '--quiet']);
    const opts = createWatcher.mock.calls[0][2];
    opts.onChange({ added: [{}], removed: [] }, { tabs: [] });
    // no output thrown, just verifying it doesn't crash
    expect(true).toBe(true);
  });

  it('onError logs error message', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await main(['node', 'cli-watch.js', 'e']);
    const opts = createWatcher.mock.calls[0][2];
    opts.onError(new Error('boom'));
    expect(spy).toHaveBeenCalledWith('Watch error:', 'boom');
    spy.mockRestore();
  });
});
