// Tag management for sessions

/**
 * Add tags to a session object
 * @param {object} session
 * @param {string[]} tags
 * @returns {object}
 */
function addTags(session, tags) {
  const existing = session.tags || [];
  const merged = Array.from(new Set([...existing, ...tags.map(t => t.trim().toLowerCase())])).filter(Boolean);
  return { ...session, tags: merged };
}

/**
 * Remove tags from a session object
 * @param {object} session
 * @param {string[]} tags
 * @returns {object}
 */
function removeTags(session, tags) {
  const remove = new Set(tags.map(t => t.trim().toLowerCase()));
  const remaining = (session.tags || []).filter(t => !remove.has(t));
  return { ...session, tags: remaining };
}

/**
 * Filter sessions by tag
 * @param {object[]} sessions
 * @param {string} tag
 * @returns {object[]}
 */
function filterByTag(sessions, tag) {
  const needle = tag.trim().toLowerCase();
  return sessions.filter(s => Array.isArray(s.tags) && s.tags.includes(needle));
}

/**
 * List all unique tags across sessions
 * @param {object[]} sessions
 * @returns {string[]}
 */
function listAllTags(sessions) {
  const set = new Set();
  for (const s of sessions) {
    if (Array.isArray(s.tags)) s.tags.forEach(t => set.add(t));
  }
  return Array.from(set).sort();
}

module.exports = { addTags, removeTags, filterByTag, listAllTags };
