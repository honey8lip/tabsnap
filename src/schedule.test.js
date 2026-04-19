import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { setSchedule, removeSchedule, loadSchedule, isDue } from './schedule.js';

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tabsnap-sched-'));
  process.env.HOME = tmpDir;
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('setSchedule', () => {
  it('creates a schedule entry', () => {
    const entry = setSchedule('work', 30);
    expect(entry.name).toBe('work');
    expect(entry.intervalMinutes).toBe(30);
    expect(entry.lastRun).toBeNull();
  });

  it('persists to disk', () => {
    setSchedule('daily', 60);
    const schedule = loadSchedule();
    expect(schedule['daily']).toBeDefined();
  });
});

describe('removeSchedule', () => {
  it('removes an existing entry', () => {
    setSchedule('tmp', 10);
    removeSchedule('tmp');
    expect(loadSchedule()['tmp']).toBeUndefined();
  });

  it('throws if not found', () => {
    expect(() => removeSchedule('ghost')).toThrow('No schedule found');
  });
});

describe('isDue', () => {
  it('returns true if never run', () => {
    expect(isDue({ lastRun: null, intervalMinutes: 30 })).toBe(true);
  });

  it('returns false if recently run', () => {
    const entry = { lastRun: new Date().toISOString(), intervalMinutes: 60 };
    expect(isDue(entry)).toBe(false);
  });

  it('returns true if interval elapsed', () => {
    const old = new Date(Date.now() - 90 * 60 * 1000).toISOString();
    expect(isDue({ lastRun: old, intervalMinutes: 60 })).toBe(true);
  });
});
