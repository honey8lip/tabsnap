import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRecentSessions, formatRecent, getLatestSession } from './recent.js';

vi.mock('./storage.js', () => ({
  listSessions: vi.fn(),
  loadSession: vi.fn(),
}));

import { listSessions, loadSession } from './storage.js';

const makeSession = (savedAt, tabs = [], browser = 'chrome') => ({
  savedAt,
  tabs,
  browser,
});

beforeEach(() => vi.clearAllMocks());

describe('getRecentSessions', () => {
  it('returns sessions sorted by savedAt descending', async () => {
    listSessions.mockResolvedValue(['old', 'new', 'mid']);
    loadSession
      .mockResolvedValueOnce(makeSession('2024-01-01T00:00:00Z', [1, 2]))
      .mockResolvedValueOnce(makeSession('2024-03-01T00:00:00Z', [1]))
      .mockResolvedValueOnce(makeSession('2024-02-01T00:00:00Z', [1, 2, 3]));

    const result = await getRecentSessions('/sessions');
    expect(result[0].name).toBe('new');
    expect(result[1].name).toBe('mid');
    expect(result[2].name).toBe('old');
  });

  it('respects limit', async () => {
    listSessions.mockResolvedValue(['a', 'b', 'c']);
    loadSession.mockResolvedValue(makeSession('2024-01-01T00:00:00Z'));
    const result = await getRecentSessions('/sessions', 2);
    expect(result.length).toBe(2);
  });

  it('skips sessions that fail to load', async () => {
    listSessions.mockResolvedValue(['good', 'bad']);
    loadSession
      .mockResolvedValueOnce(makeSession('2024-01-01T00:00:00Z'))
      .mockRejectedValueOnce(new Error('read error'));
    const result = await getRecentSessions('/sessions');
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('good');
  });
});

describe('formatRecent', () => {
  it('returns message when empty', () => {
    expect(formatRecent([])).toBe('No sessions found.');
  });

  it('formats entries with tab count and browser', () => {
    const recent = [
      { name: 'work', session: makeSession('2024-06-01T10:00:00Z', [1, 2, 3], 'firefox') },
    ];
    const output = formatRecent(recent);
    expect(output).toContain('work');
    expect(output).toContain('3 tabs');
    expect(output).toContain('firefox');
  });

  it('handles singular tab count', () => {
    const recent = [
      { name: 's', session: makeSession('2024-01-01T00:00:00Z', [1]) },
    ];
    expect(formatRecent(recent)).toContain('1 tab,');
  });
});

describe('getLatestSession', () => {
  it('returns the most recent session', async () => {
    listSessions.mockResolvedValue(['a']);
    loadSession.mockResolvedValue(makeSession('2024-05-01T00:00:00Z', [1, 2]));
    const result = await getLatestSession('/sessions');
    expect(result.name).toBe('a');
  });

  it('returns null when no sessions exist', async () => {
    listSessions.mockResolvedValue([]);
    const result = await getLatestSession('/sessions');
    expect(result).toBeNull();
  });
});
