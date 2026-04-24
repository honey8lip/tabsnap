import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hashSession, buildSyncManifest, diffWithRemote, exportSyncBundle, importSyncBundle, formatSyncReport } from './sync.js';

vi.mock('./storage.js', () => ({
  loadSession: vi.fn(),
  saveSession: vi.fn(),
  listSessions: vi.fn(),
}));

import { loadSession, saveSession, listSessions } from './storage.js';

const mockSession = { name: 'work', tabs: [{ url: 'https://a.com' }, { url: 'https://b.com' }] };

beforeEach(() => vi.clearAllMocks());

describe('hashSession', () => {
  it('returns 8-char hex string', () => {
    const h = hashSession(mockSession);
    expect(h).toMatch(/^[a-f0-9]{8}$/);
  });
  it('same tabs same hash', () => {
    expect(hashSession(mockSession)).toBe(hashSession(mockSession));
  });
});

describe('buildSyncManifest', () => {
  it('builds manifest from names', () => {
    const m = buildSyncManifest(['a', 'b']);
    expect(m).toHaveProperty('a');
    expect(m.a.synced).toBe(false);
  });
});

describe('diffWithRemote', () => {
  it('detects added and removed', async () => {
    const diff = await diffWithRemote(['a', 'b'], { b: {}, c: {} });
    expect(diff.added).toEqual(['a']);
    expect(diff.removed).toEqual(['c']);
    expect(diff.common).toEqual(['b']);
  });
});

describe('exportSyncBundle', () => {
  it('exports sessions into bundle', async () => {
    loadSession.mockResolvedValue(mockSession);
    const bundle = await exportSyncBundle(['work'], '/tmp');
    expect(bundle.sessions['work']).toMatchObject({ name: 'work' });
    expect(bundle.sessions['work']._hash).toBeDefined();
  });
});

describe('importSyncBundle', () => {
  it('imports new sessions', async () => {
    listSessions.mockResolvedValue([]);
    saveSession.mockResolvedValue();
    const bundle = { sessions: { work: { ...mockSession, _hash: 'abc' } } };
    const r = await importSyncBundle(bundle, '/tmp');
    expect(r.imported).toContain('work');
  });
  it('skips existing without overwrite', async () => {
    listSessions.mockResolvedValue(['work']);
    const bundle = { sessions: { work: { ...mockSession, _hash: 'abc' } } };
    const r = await importSyncBundle(bundle, '/tmp');
    expect(r.skipped).toContain('work');
  });
});

describe('formatSyncReport', () => {
  it('returns nothing message when empty', () => {
    expect(formatSyncReport({ imported: [], skipped: [], errors: [] })).toBe('Nothing to sync.');
  });
  it('lists imported names', () => {
    expect(formatSyncReport({ imported: ['work'], skipped: [], errors: [] })).toContain('work');
  });
});
