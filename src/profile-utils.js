/**
 * Utility helpers for profile feature.
 */

/**
 * Merge two profile maps: later entries win.
 */
export function mergeProfileMaps(base, override) {
  return { ...base, ...override };
}

/**
 * Build a map of { sessionName -> profileName } from a list of sessions.
 */
export function buildProfileMap(sessions) {
  const map = {};
  for (const s of sessions) {
    if (s.name && s.profile) map[s.name] = s.profile;
  }
  return map;
}

/**
 * Given a profile map, apply it to a list of sessions.
 */
export function applyProfileMap(sessions, map) {
  return sessions.map(s => {
    if (map[s.name]) return { ...s, profile: map[s.name] };
    return s;
  });
}

/**
 * Validate a profile name: alphanumeric, hyphens, underscores only.
 */
export function validateProfileName(name) {
  if (!name || typeof name !== 'string') return false;
  return /^[a-zA-Z0-9_-]+$/.test(name.trim());
}

/**
 * Return sessions that have no profile assigned.
 */
export function unassignedSessions(sessions) {
  return sessions.filter(s => !s.profile);
}

/**
 * Count sessions per profile.
 */
export function profileCounts(sessions) {
  const counts = {};
  for (const s of sessions) {
    if (s.profile) counts[s.profile] = (counts[s.profile] || 0) + 1;
  }
  return counts;
}
