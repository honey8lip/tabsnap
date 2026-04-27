// label.js — attach/remove/query short display labels on sessions

/**
 * Set a label on a session (replaces any existing label).
 * @param {object} session
 * @param {string} label
 * @returns {object} updated session
 */
export function setLabel(session, label) {
  if (!label || typeof label !== 'string') throw new Error('Label must be a non-empty string');
  const trimmed = label.trim();
  if (trimmed.length === 0) throw new Error('Label must be a non-empty string');
  if (trimmed.length > 64) throw new Error('Label must be 64 characters or fewer');
  return { ...session, label: trimmed };
}

/**
 * Remove the label from a session.
 * @param {object} session
 * @returns {object} updated session
 */
export function removeLabel(session) {
  const copy = { ...session };
  delete copy.label;
  return copy;
}

/**
 * Get the label for a session, or null if none.
 * @param {object} session
 * @returns {string|null}
 */
export function getLabel(session) {
  return session.label || null;
}

/**
 * Return true if the session has a label.
 * @param {object} session
 * @returns {boolean}
 */
export function hasLabel(session) {
  return Boolean(session.label);
}

/**
 * Filter sessions that have any label set.
 * @param {object[]} sessions
 * @returns {object[]}
 */
export function filterLabeled(sessions) {
  return sessions.filter(hasLabel);
}

/**
 * Filter sessions matching a specific label (case-insensitive).
 * @param {object[]} sessions
 * @param {string} label
 * @returns {object[]}
 */
export function filterByLabel(sessions, label) {
  const lower = label.trim().toLowerCase();
  return sessions.filter(s => s.label && s.label.toLowerCase() === lower);
}

/**
 * Collect all unique labels across sessions.
 * @param {object[]} sessions
 * @returns {string[]}
 */
export function listLabels(sessions) {
  const seen = new Set();
  for (const s of sessions) {
    if (s.label) seen.add(s.label);
  }
  return [...seen].sort();
}
