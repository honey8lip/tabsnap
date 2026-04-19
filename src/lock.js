import { join } from 'path';
import { existsSync, writeFileSync, unlinkSync, readFileSync } from 'fs';
import { ensureDir } from './storage.js';

const LOCK_DIR = join(process.env.HOME || '/tmp', '.tabsnap');
const LOCK_FILE = join(LOCK_DIR, 'tabsnap.lock');

export function acquireLock() {
  ensureDir(LOCK_DIR);
  if (existsSync(LOCK_FILE)) {
    const info = readLock();
    if (info && isProcessAlive(info.pid)) {
      return false;
    }
    // stale lock
    releaseLock();
  }
  writeFileSync(LOCK_FILE, JSON.stringify({ pid: process.pid, ts: Date.now() }));
  return true;
}

export function releaseLock() {
  if (existsSync(LOCK_FILE)) {
    unlinkSync(LOCK_FILE);
  }
}

export function readLock() {
  if (!existsSync(LOCK_FILE)) return null;
  try {
    return JSON.parse(readFileSync(LOCK_FILE, 'utf8'));
  } catch {
    return null;
  }
}

export function isLocked() {
  const info = readLock();
  if (!info) return false;
  return isProcessAlive(info.pid);
}

function isProcessAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}
