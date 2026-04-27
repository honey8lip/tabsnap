import { loadSession, saveSession, listSessions, deleteSession } from './storage.js';

/**
 * Check if a session has expired based on its saved timestamp and a TTL (ms).
 */
export function isExpired(session, ttlMs) {
  if (!session.savedAt) return false;
  const age = Date.now() - new Date(session.savedAt).getTime();
  return age > ttlMs;
}

/**
 * Return all sessions older than ttlMs.
 */
export async function findExpired(dir, ttlMs) {
  const names = await listSessions(dir);
  const expired = [];
  for (const name of names) {
    const session = await loadSession(dir, name);
    if (isExpired(session, ttlMs)) {
      expired.push({ name, session });
    }
  }
  return expired;
}

/**
 * Delete all sessions older than ttlMs. Returns list of deleted names.
 */
export async function purgeExpired(dir, ttlMs) {
  const expired = await findExpired(dir, ttlMs);
  const deleted = [];
  for (const { name } of expired) {
    await deleteSession(dir, name);
    deleted.push(name);
  }
  return deleted;
}

/**
 * Set an explicit expiry date on a session.
 */
export async function setExpiry(dir, name, expiresAt) {
  const session = await loadSession(dir, name);
  session.expiresAt = expiresAt instanceof Date ? expiresAt.toISOString() : expiresAt;
  await saveSession(dir, name, session);
  return session;
}

/**
 * Remove expiry metadata from a session.
 */
export async function clearExpiry(dir, name) {
  const session = await loadSession(dir, name);
  delete session.expiresAt;
  await saveSession(dir, name, session);
  return session;
}

/**
 * Format a human-readable expiry summary for a session.
 */
export function expirySummary(session) {
  if (session.expiresAt) {
    const d = new Date(session.expiresAt);
    const now = Date.now();
    if (d.getTime() < now) return `expired on ${d.toLocaleDateString()}`;
    return `expires on ${d.toLocaleDateString()}`;
  }
  if (session.savedAt) {
    const ageDays = Math.floor((Date.now() - new Date(session.savedAt).getTime()) / 86400000);
    return `saved ${ageDays}d ago, no expiry set`;
  }
  return 'no expiry info';
}
