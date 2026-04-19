import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sessionStats, globalStats } from './stats.js';

vi.mock('./storage.js', () => ({
  listSessions: vi.fn(),
  loadSession: vi.fn(),
}));

import { listSessions, loadSession } from './storage.js';

const mockSession = (overrides = {}) => ({
  tabs: [
    { url: 'https://github.com/foo', title: 'Foo' },
    { url: 'https://github.com/bar', title: 'Bar' },
    { url: 'https://news.ycombinator.com', title: 'HN' },
  ],
  tags: ['work'],
  pinned: false,
  createdAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

describe('sessionStats', () => {
  it('returns tab count and unique domains', async () => {
    loadSession.mockResolvedValue(mockSession());
    const stats = await sessionStats('mysession');
    expect(stats.tabCount).toBe(3);
    expect(stats.uniqueDomains).toBe(2);
    expect(stats.name).toBe('mysession');
  });

  it('returns top domains sorted by count', async () => {
    loadSession.mockResolvedValue(mockSession());
    const stats = await sessionStats('mysession');
    expect(stats.topDomains[0].domain).toBe('github.com');
    expect(stats.topDomains[0].count).toBe(2);
  });

  it('handles empty tabs', async () => {
    loadSession.mockResolvedValue({ tabs: [], tags: [] });
    const stats = await sessionStats('empty');
    expect(stats.tabCount).toBe(0);
    expect(stats.uniqueDomains).toBe(0);
  });
});

describe('globalStats', () => {
  beforeEach(() => {
    listSessions.mockResolvedValue(['a', 'b']);
    loadSession.mockImplementation(name =>
      Promise.resolve(mockSession({ pinned: name === 'a', tags: name === 'a' ? ['work'] : ['personal'] }))
    );
  });

  it('counts sessions and total tabs', async () => {
    const stats = await globalStats();
    expect(stats.sessionCount).toBe(2);
    expect(stats.totalTabs).toBe(6);
    expect(stats.avgTabsPerSession).toBe(3);
  });

  it('counts pinned sessions', async () => {
    const stats = await globalStats();
    expect(stats.pinnedCount).toBe(1);
  });

  it('aggregates top domains across sessions', async () => {
    const stats = await globalStats();
    expect(stats.topDomains[0].domain).toBe('github.com');
    expect(stats.topDomains[0].count).toBe(4);
  });

  it('returns empty stats when no sessions', async () => {
    listSessions.mockResolvedValue([]);
    const stats = await globalStats();
    expect(stats.avgTabsPerSession).toBe(0);
    expect(stats.topDomains).toHaveLength(0);
  });
});
