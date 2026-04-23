import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createWatcher, watcherStatus } from './watch.js';

vi.mock('./storage.js', () => ({
  loadSession: vi.fn().mockResolvedValue(null),
  saveSession: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('./diff.js', () => ({
  diffSessions: vi.fn().mockReturnValue({ added: [], removed: [] }),
}));

import { loadSession, saveSession } from './storage.js';
import { diffSessions } from './diff.js';

const makeSession = (urls) => ({ tabs: urls.map((u) => ({ url: u, title: u })) });

beforeEach(() => vi.clearAllMocks());

describe('createWatcher', () => {
  it('starts and stops', async () => {
    const capture = vi.fn().mockResolvedValue(makeSession(['https://a.com']));
    const w = createWatcher('test', capture, { intervalMs: 10000 });
    await w.start();
    expect(w.isRunning()).toBe(true);
    w.stop();
    expect(w.isRunning()).toBe(false);
  });

  it('saves session on first capture', async () => {
    const session = makeSession(['https://a.com']);
    const capture = vi.fn().mockResolvedValue(session);
    const w = createWatcher('first', capture, { intervalMs: 10000 });
    await w.start();
    expect(saveSession).toHaveBeenCalledWith('first', session);
    w.stop();
  });

  it('calls onChange when diff has changes', async () => {
    diffSessions.mockReturnValueOnce({ added: [{ url: 'https://b.com' }], removed: [] });
    loadSession.mockResolvedValueOnce(makeSession(['https://a.com']));
    const onChange = vi.fn();
    const capture = vi.fn().mockResolvedValue(makeSession(['https://a.com', 'https://b.com']));
    const w = createWatcher('delta', capture, { intervalMs: 10000, onChange });
    await w.start();
    expect(onChange).toHaveBeenCalled();
    w.stop();
  });

  it('calls onError on capture failure', async () => {
    const onError = vi.fn();
    const capture = vi.fn().mockRejectedValue(new Error('fail'));
    const w = createWatcher('err', capture, { intervalMs: 10000, onError });
    await w.start();
    expect(onError).toHaveBeenCalled();
    w.stop();
  });
});

describe('watcherStatus', () => {
  it('reflects running state', async () => {
    const capture = vi.fn().mockResolvedValue(makeSession([]));
    const w = createWatcher('s', capture, { intervalMs: 10000 });
    expect(watcherStatus(w).running).toBe(false);
    await w.start();
    expect(watcherStatus(w).running).toBe(true);
    w.stop();
  });
});
