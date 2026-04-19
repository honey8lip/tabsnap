import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./browser.js', () => ({
  detectBrowser: () => 'chrome',
  parseTabs: () => [{ url: 'https://example.com', title: 'Ex' }],
  formatSession: (tabs, opts) => ({ name: opts.name || 'snap', tabs, tags: [], browser: opts.browser }),
}));

vi.mock('./storage.js', () => ({
  saveSession: vi.fn(),
  loadSession: vi.fn().mockResolvedValue({
    name: 'old',
    tabs: [{ url: 'https://old.com' }],
  }),
  listSessions: vi.fn().mockResolvedValue([]),
}));

vi.mock('./snapshot.js', async () => {
  const actual = await vi.importActual('./snapshot.js');
  return {
    ...actual,
    saveSnapshot: vi.fn().mockResolvedValue({ name: 'snap-123', tabs: [{ url: 'https://example.com' }], tags: [] }),
  };
});

import { saveSnapshot } from './snapshot.js';

describe('cli-snapshot', () => {
  it('calls saveSnapshot', async () => {
    await import('./cli-snapshot.js');
    expect(saveSnapshot).toHaveBeenCalled();
  });
});
