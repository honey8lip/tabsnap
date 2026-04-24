import { loadSession, saveSession, listSessions } from './storage.js';
import { createHash } from 'crypto';

export function hashSession(session) {
  const str = JSON.stringify(session.tabs.map(t => t.url).sort());
  return createHash('md5').update(str).digest('hex').slice(0, 8);
}

export function buildSyncManifest(sessions) {
  const manifest = {};
  for (const name of sessions) {
    manifest[name] = { name, hash: null, synced: false };
  }
  return manifest;
}

export async function diffWithRemote(localNames, remoteManifest) {
  const added = localNames.filter(n => !remoteManifest[n]);
  const removed = Object.keys(remoteManifest).filter(n => !localNames.includes(n));
  const common = localNames.filter(n => remoteManifest[n]);
  return { added, removed, common };
}

export async function exportSyncBundle(names, dir) {
  const bundle = { version: 1, exported: new Date().toISOString(), sessions: {} };
  for (const name of names) {
    const session = await loadSession(dir, name);
    if (session) {
      bundle.sessions[name] = { ...session, _hash: hashSession(session) };
    }
  }
  return bundle;
}

export async function importSyncBundle(bundle, dir, { overwrite = false } = {}) {
  const results = { imported: [], skipped: [], errors: [] };
  const existing = await listSessions(dir);
  for (const [name, session] of Object.entries(bundle.sessions)) {
    if (existing.includes(name) && !overwrite) {
      results.skipped.push(name);
      continue;
    }
    try {
      const { _hash, ...clean } = session;
      await saveSession(dir, name, clean);
      results.imported.push(name);
    } catch (err) {
      results.errors.push({ name, error: err.message });
    }
  }
  return results;
}

export function formatSyncReport(results) {
  const lines = [];
  if (results.imported.length) lines.push(`Imported: ${results.imported.join(', ')}`);
  if (results.skipped.length) lines.push(`Skipped (already exist): ${results.skipped.join(', ')}`);
  if (results.errors.length) lines.push(`Errors: ${results.errors.map(e => e.name).join(', ')}`);
  return lines.join('\n') || 'Nothing to sync.';
}
