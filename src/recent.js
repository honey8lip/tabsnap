import { listSessions, loadSession } from './storage.js';

/**
 * Get sessions sorted by last accessed/saved date, most recent first.
 * @param {string} dir - sessions directory
 * @param {number} limit - max number of sessions to return
 */
export async function getRecentSessions(dir, limit = 10) {
  const names = await listSessions(dir);
  const sessions = [];

  for (const name of names) {
    try {
      const session = await loadSession(dir, name);
      sessions.push({ name, session });
    } catch {
      // skip unreadable sessions
    }
  }

  sessions.sort((a, b) => {
    const dateA = new Date(a.session.savedAt || 0).getTime();
    const dateB = new Date(b.session.savedAt || 0).getTime();
    return dateB - dateA;
  });

  return sessions.slice(0, limit);
}

/**
 * Format recent sessions for display.
 * @param {Array} recent - array of { name, session } objects
 */
export function formatRecent(recent) {
  if (recent.length === 0) {
    return 'No sessions found.';
  }

  const lines = recent.map((entry, i) => {
    const { name, session } = entry;
    const date = session.savedAt
      ? new Date(session.savedAt).toLocaleString()
      : 'unknown date';
    const tabCount = Array.isArray(session.tabs) ? session.tabs.length : 0;
    const browser = session.browser || 'unknown';
    return `  ${i + 1}. ${name} — ${tabCount} tab${tabCount !== 1 ? 's' : ''}, ${browser}, saved ${date}`;
  });

  return `Recent sessions:\n${lines.join('\n')}`;
}

/**
 * Get the most recently saved session.
 * @param {string} dir - sessions directory
 */
export async function getLatestSession(dir) {
  const recent = await getRecentSessions(dir, 1);
  return recent.length > 0 ? recent[0] : null;
}
