import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setAlias, removeAlias, resolveAlias, listAliases, formatAliasTable } from './alias.js';
import * as storage from './storage.js';

vi.mock('./storage.js');

const dir = '/tmp/tabsnap';

beforeEach(() => {
  vi.resetAllMocks();
  storage.loadSession.mockRejectedValue(new Error('not found'));
  storage.listSessions.mockResolvedValue(['work', 'personal']);
  storage.saveSession.mockResolvedValue();
});

describe('setAlias', () => {
  it('creates an alias for an existing session', async () => {
    const result = await setAlias(dir, 'w', 'work');
    expect(result).toEqual({ w: 'work' });
    expect(storage.saveSession).toHaveBeenCalled();
  });

  it('throws if session does not exist', async () => {
    await expect(setAlias(dir, 'x', 'missing')).rejects.toThrow('not found');
  });
});

describe('removeAlias', () => {
  it('removes an existing alias', async () => {
    storage.loadSession.mockResolvedValue({ aliases: { w: 'work' } });
    const result = await removeAlias(dir, 'w');
    expect(result).toEqual({});
  });

  it('throws if alias does not exist', async () => {
    storage.loadSession.mockResolvedValue({ aliases: {} });
    await expect(removeAlias(dir, 'nope')).rejects.toThrow('not found');
  });
});

describe('resolveAlias', () => {
  it('returns the target session name for a known alias', async () => {
    storage.loadSession.mockResolvedValue({ aliases: { w: 'work' } });
    expect(await resolveAlias(dir, 'w')).toBe('work');
  });

  it('returns the input unchanged if no alias matches', async () => {
    storage.loadSession.mockResolvedValue({ aliases: {} });
    expect(await resolveAlias(dir, 'personal')).toBe('personal');
  });
});

describe('formatAliasTable', () => {
  it('formats aliases into a readable table', () => {
    const out = formatAliasTable({ w: 'work', p: 'personal' });
    expect(out).toContain('w');
    expect(out).toContain('work');
  });

  it('returns a message when no aliases exist', () => {
    expect(formatAliasTable({})).toBe('No aliases defined.');
  });
});
