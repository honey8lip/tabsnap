import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isExpired, findExpired, purgeExpired, setExpiry, clearExpiry, expirySummary } from './expire.js';

vi.mock('./storage.js', () => ({
  listSessions: vi.fn(),
  loadSession: vi.fn(),
  saveSession: vi.fn(),
  deleteSession: vi.fn(),
}));

import { listSessions, loadSession, saveSession, deleteSession } from './storage.js';

const DAY = 86400000;

beforeEach(() => vi.clearAllMocks());

describe('isExpired', () => {
  it('returns true when session is older than ttl', () => {
    const savedAt = new Date(Date.now() - DAY * 10).toISOString();
    expect(isExpired({ savedAt }, DAY * 7)).toBe(true);
  });

  it('returns false when session is within ttl', () => {
    const savedAt = new Date(Date.now() - DAY * 2).toISOString();
    expect(isExpired({ savedAt }, DAY * 7)).toBe(false);
  });

  it('returns false when no savedAt', () => {
    expect(isExpired({}, DAY)).toBe(false);
  });
});

describe('findExpired', () => {
  it('returns only expired sessions', async () => {
    listSessions.mockResolvedValue(['old', 'new']);
    loadSession
      .mockResolvedValueOnce({ savedAt: new Date(Date.now() - DAY * 10).toISOString() })
      .mockResolvedValueOnce({ savedAt: new Date(Date.now() - DAY * 1).toISOString() });
    const result = await findExpired('/dir', DAY * 7);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('old');
  });
});

describe('purgeExpired', () => {
  it('deletes expired sessions and returns names', async () => {
    listSessions.mockResolvedValue(['stale']);
    loadSession.mockResolvedValue({ savedAt: new Date(Date.now() - DAY * 30).toISOString() });
    deleteSession.mockResolvedValue();
    const deleted = await purgeExpired('/dir', DAY * 7);
    expect(deleted).toEqual(['stale']);
    expect(deleteSession).toHaveBeenCalledWith('/dir', 'stale');
  });
});

describe('setExpiry / clearExpiry', () => {
  it('sets expiresAt on a session', async () => {
    loadSession.mockResolvedValue({ name: 'test' });
    saveSession.mockResolvedValue();
    const d = new Date('2030-01-01');
    const s = await setExpiry('/dir', 'test', d);
    expect(s.expiresAt).toBe(d.toISOString());
  });

  it('removes expiresAt on clearExpiry', async () => {
    loadSession.mockResolvedValue({ name: 'test', expiresAt: '2030-01-01T00:00:00.000Z' });
    saveSession.mockResolvedValue();
    const s = await clearExpiry('/dir', 'test');
    expect(s.expiresAt).toBeUndefined();
  });
});

describe('expirySummary', () => {
  it('reports expired when expiresAt is in the past', () => {
    const s = { expiresAt: new Date(Date.now() - DAY).toISOString() };
    expect(expirySummary(s)).toMatch(/expired on/);
  });

  it('reports future expiry', () => {
    const s = { expiresAt: new Date(Date.now() + DAY * 10).toISOString() };
    expect(expirySummary(s)).toMatch(/expires on/);
  });

  it('reports age when no expiry set', () => {
    const s = { savedAt: new Date(Date.now() - DAY * 3).toISOString() };
    expect(expirySummary(s)).toMatch(/3d ago/);
  });

  it('returns fallback when no info', () => {
    expect(expirySummary({})).toBe('no expiry info');
  });
});
