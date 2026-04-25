// trim.js — remove old/excess tabs from sessions

/**
 * Remove tabs beyond a maximum count, keeping the most recent (last) ones.
 * @param {object} session
 * @param {number} maxTabs
 * @returns {object} trimmed session
 */
function trimToMax(session, maxTabs) {
  if (!session || !Array.isArray(session.tabs)) return session;
  if (session.tabs.length <= maxTabs) return session;
  return {
    ...session,
    tabs: session.tabs.slice(session.tabs.length - maxTabs),
  };
}

/**
 * Remove tabs matching a domain pattern (string or RegExp).
 * @param {object} session
 * @param {string|RegExp} pattern
 * @returns {object} filtered session
 */
function trimByDomain(session, pattern) {
  if (!session || !Array.isArray(session.tabs)) return session;
  const test = typeof pattern === 'string'
    ? (url) => url.includes(pattern)
    : (url) => pattern.test(url);
  return {
    ...session,
    tabs: session.tabs.filter((tab) => !test(tab.url || '')),
  };
}

/**
 * Remove duplicate tabs (by URL) keeping the first occurrence.
 * @param {object} session
 * @returns {object} deduplicated session
 */
function trimDuplicates(session) {
  if (!session || !Array.isArray(session.tabs)) return session;
  const seen = new Set();
  return {
    ...session,
    tabs: session.tabs.filter((tab) => {
      if (seen.has(tab.url)) return false;
      seen.add(tab.url);
      return true;
    }),
  };
}

/**
 * Summary of what was trimmed.
 * @param {object} before
 * @param {object} after
 * @returns {object}
 */
function trimSummary(before, after) {
  const removed = (before.tabs || []).length - (after.tabs || []).length;
  return {
    before: (before.tabs || []).length,
    after: (after.tabs || []).length,
    removed,
  };
}

module.exports = { trimToMax, trimByDomain, trimDuplicates, trimSummary };
