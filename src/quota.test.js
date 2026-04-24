import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkQuota, formatQuotaReport, quotaReport, DEFAULT_QUOTA } from './quota.js';

vi.mock('./storage.js', () => ({
  listSessions: vi.fn(),
  loadSession: vi.fn()
}));

vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn(() => true),
    readdirSync: vi.fn(() => ['a.json', 'b.json']),
    statSync: vi.fn(() => ({ isFile: () => true, size: 1024 * 1024 }))
  }
}));

import { listSessions, loadSession } from './storage.js';

describe('checkQuota', () => {
  it('returns empty array when within limits', () => {
    expect(checkQuota(5, 100, 1)).toEqual([]);
  });

  it('reports session count violation', () => {
    const v = checkQuota(200, 100, 1);
    expect(v.some(s => s.includes('session count'))).toBe(true);
  });

  it('reports total tab violation', () => {
    const v = checkQuota(5, 9999, 1);
    expect(v.some(s => s.includes('total tab'))).toBe(true);
  });

  it('reports storage violation', () => {
    const v = checkQuota(5, 100, 99);
    expect(v.some(s => s.includes('storage'))).toBe(true);
  });
});

describe('quotaReport', () => {
  beforeEach(() => {
    listSessions.mockResolvedValue(['sess1', 'sess2']);
    loadSession.mockResolvedValue({ tabs: [{ url: 'https://a.com' }] });
  });

  it('returns session count and total tabs', async () => {
    const r = await quotaReport('/fake/dir');
    expect(r.sessionCount).toBe(2);
    expect(r.totalTabs).toBe(2);
  });

  it('sets ok=true when within limits', async () => {
    const r = await quotaReport('/fake/dir');
    expect(r.ok).toBe(true);
  });
});

describe('formatQuotaReport', () => {
  it('shows all quota OK when no violations', () => {
    const report = { sessionCount: 1, totalTabs: 5, storageMb: 0.1, violations: [], perSession: [], ok: true };
    expect(formatQuotaReport(report)).toContain('All quotas OK');
  });

  it('lists violations', () => {
    const report = { sessionCount: 200, totalTabs: 5, storageMb: 0.1, violations: ['session count (200) exceeds limit of 100'], perSession: [], ok: false };
    expect(formatQuotaReport(report)).toContain('Violations');
  });
});
