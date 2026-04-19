import { listSessions, loadSession, saveSession } from './storage.js';
import path from 'path';
import fs from 'fs/promises';

export async function backupSession(name, backupDir) {
  const session = await loadSession(name);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupName = `${name}_backup_${timestamp}`;
  await saveSession(backupName, { ...session, backupOf: name, backedUpAt: new Date().toISOString() }, backupDir);
  return backupName;
}

export async function listBackups(name, backupDir) {
  const sessions = await listSessions(backupDir);
  return sessions.filter(s => s.startsWith(`${name}_backup_`));
}

export async function restoreBackup(backupName, targetName, backupDir, sessionDir) {
  const session = await loadSession(backupName, backupDir);
  const { backupOf, backedUpAt, ...rest } = session;
  await saveSession(targetName, rest, sessionDir);
  return rest;
}

export async function pruneBackups(name, backupDir, keep = 5) {
  const backups = await listBackups(name, backupDir);
  backups.sort();
  const toDelete = backups.slice(0, Math.max(0, backups.length - keep));
  for (const b of toDelete) {
    const file = path.join(backupDir, `${b}.json`);
    await fs.unlink(file);
  }
  return toDelete;
}

export function backupSummary(backups) {
  if (!backups.length) return 'No backups found.';
  return backups.map((b, i) => `  ${i + 1}. ${b}`).join('\n');
}
