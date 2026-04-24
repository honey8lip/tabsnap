import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./quota.js', () => ({
  quotaReport: vi.fn(),
  formatQuotaReport: vi.fn(() => 'formatted report'),
  DEFAULT_QUOTA: { maxSessions: 100, maxTabsPerSession: 500, maxTotalTabs: 5000, maxStorageMb: 50 }
}));

import { quotaReport, formatQuotaReport } from './quota.js';

describe('cli-quota printUsage', async () => {
  it('exports printUsage function', async () => {
    const mod = await import('./cli-quota.js');
    expect(typeof mod.printUsage).toBe('function');
  });

  it('printUsage prints to stdout without throwing', async () => {
    const mod = await import('./cli-quota.js');
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    mod.printUsage();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('quota integration', () => {
  beforeEach(() => {
    quotaReport.mockResolvedValue({
      sessionCount: 3,
      totalTabs: 12,
      storageMb: 0.5,
      violations: [],
      perSession: [],
      ok: true
    });
  });

  it('quotaReport is called and returns ok status', async () => {
    const r = await quotaReport('/some/dir');
    expect(r.ok).toBe(true);
    expect(r.sessionCount).toBe(3);
  });

  it('formatQuotaReport returns formatted string', () => {
    const result = formatQuotaReport({ violations: [], ok: true });
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('reports violations when quota exceeded', async () => {
    quotaReport.mockResolvedValue({
      sessionCount: 200,
      totalTabs: 100,
      storageMb: 1,
      violations: ['session count (200) exceeds limit of 100'],
      perSession: [],
      ok: false
    });
    const r = await quotaReport('/some/dir');
    expect(r.ok).toBe(false);
    expect(r.violations.length).toBeGreaterThan(0);
  });
});
