import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSnapshot, snapshotWithMeta, diffSnapshots } from './snapshot.js';

const mockTabs = [
  { url: 'https://example.com', title: 'Example' },
  { url: 'https://news.ycombinator.com', title: 'HN' },
];

describe('createSnapshot', () => {
  it('returns a session object', () => {
    const session = createSnapshot(mockTabs, { name: 'test', browser: 'chrome' });
    expect(session).toHaveProperty('name');
    expect(session).toHaveProperty('tabs');
  });
});

describe('snapshotWithMeta', () => {
  it('attaches notes to session', () => {
    const session = snapshotWithMeta(mockTabs, { name: 'noted', notes: 'my note' });
    expect(session.notes).toBe('my note');
  });

  it('sets snapshotAt timestamp', () => {
    const session = snapshotWithMeta(mockTabs, { name: 'ts' });
    expect(session.snapshotAt).toBeDefined();
  });

  it('applies tags when provided', () => {
    const session = snapshotWithMeta(mockTabs, { name: 'tagged', tags: ['work'] });
    expect(session.tags).toContain('work');
  });
});

describe('diffSnapshots', () => {
  const a = { tabs: [{ url: 'https://a.com' }, { url: 'https://b.com' }] };
  const b = { tabs: [{ url: 'https://b.com' }, { url: 'https://c.com' }] };

  it('finds added tabs', () => {
    const { added } = diffSnapshots(a, b);
    expect(added.map(t => t.url)).toContain('https://c.com');
  });

  it('finds removed tabs', () => {
    const { removed } = diffSnapshots(a, b);
    expect(removed.map(t => t.url)).toContain('https://a.com');
  });

  it('finds kept tabs', () => {
    const { kept } = diffSnapshots(a, b);
    expect(kept.map(t => t.url)).toContain('https://b.com');
  });
});
