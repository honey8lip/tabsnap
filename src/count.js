// count.js — session and tab counting utilities

/**
 * Count total tabs across all sessions.
 * @param {object[]} sessions
 * @returns {number}
 */
function totalTabs(sessions) {
  return sessions.reduce((sum, s) => sum + (s.tabs ? s.tabs.length : 0), 0);
}

/**
 * Count sessions that have at least one tab.
 * @param {object[]} sessions
 * @returns {number}
 */
function nonEmptySessions(sessions) {
  return sessions.filter(s => s.tabs && s.tabs.length > 0).length;
}

/**
 * Return average tab count per session (0 if no sessions).
 * @param {object[]} sessions
 * @returns {number}
 */
function averageTabCount(sessions) {
  if (!sessions.length) return 0;
  return totalTabs(sessions) / sessions.length;
}

/**
 * Return a per-session breakdown: { name, tabCount }[]
 * @param {object[]} sessions
 * @returns {object[]}
 */
function tabCountBreakdown(sessions) {
  return sessions.map(s => ({
    name: s.name,
    tabCount: s.tabs ? s.tabs.length : 0,
  }));
}

/**
 * Find the session with the most tabs.
 * Returns null if sessions array is empty.
 * @param {object[]} sessions
 * @returns {object|null}
 */
function largestSession(sessions) {
  if (!sessions.length) return null;
  return sessions.reduce((best, s) => {
    const count = s.tabs ? s.tabs.length : 0;
    const bestCount = best.tabs ? best.tabs.length : 0;
    return count > bestCount ? s : best;
  });
}

/**
 * Format a human-readable count summary.
 * @param {object[]} sessions
 * @returns {string}
 */
function formatCountSummary(sessions) {
  const total = totalTabs(sessions);
  const count = sessions.length;
  const avg = averageTabCount(sessions).toFixed(1);
  const largest = largestSession(sessions);
  const largestLine = largest
    ? `  Largest session : ${largest.name} (${largest.tabs ? largest.tabs.length : 0} tabs)`
    : '';
  return [
    `Sessions : ${count}`,
    `Total tabs: ${total}`,
    `Avg tabs  : ${avg}`,
    largestLine,
  ]
    .filter(Boolean)
    .join('\n');
}

module.exports = {
  totalTabs,
  nonEmptySessions,
  averageTabCount,
  tabCountBreakdown,
  largestSession,
  formatCountSummary,
};
