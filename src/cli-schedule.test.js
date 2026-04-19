import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tabsnap-clisched-'));
  process.env.HOME = tmpDir;
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  vi.resetModules();
});

async function run(...args) {
  process.argv = ['node', 'cli-schedule.js', 'schedule', ...args];
  const logs = [];
  const errors = [];
  const origLog = console.log;
  const origErr = console.error;
  console.log = (...a) => logs.push(a.join(' '));
  console.error = (...a) => errors.push(a.join(' '));
  try {
    await import('./cli-schedule.js?' + Math.random());
  } catch {}
  console.log = origLog;
  console.error = origErr;
  return { logs, errors };
}

describe('cli-schedule add/list/remove', () => {
  it('adds and lists a schedule', async () => {
    const { logs } = await run('add', 'focus', '20');
    expect(logs.some(l => l.includes('focus'))).toBe(true);
  });

  it('shows nothing due message on run with no schedules', async () => {
    const { logs } = await run('run');
    expect(logs.some(l => l.includes('Nothing due'))).toBe(true);
  });

  it('shows no schedules on empty list', async () => {
    const { logs } = await run('list');
    expect(logs.some(l => l.includes('No schedules'))).toBe(true);
  });
});
