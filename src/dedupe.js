// dedupe.js — remove duplicate tabs from a session

/**
 * Returns a new tabs array with duplicates removed (by URL).
 * Keeps the first occurrence of each URL.
 * @param {Array} tabs
 * @returns {Array}
 */
function dedupeTabs(tabs) {
  const seen = new Set();
  return tabs.filter(tab => {
    if (seen.has(tab.url)) return false;
    seen.add(tab.url);
    return true;
  });
}

/**
 * Returns duplicate tabs (tabs whose URL appeared earlier in the list).
 * @param {Array} tabs
 * @returns {Array}
 */
function findDuplicates(tabs) {
  const seen = new Set();
  const dupes = [];
  for (const tab of tabs) {
    if (seen.has(tab.url)) {
      dupes.push(tab);
    } else {
      seen.add(tab.url);
    }
  }
  return dupes;
}

/**
 * Dedupes tabs across multiple sessions, returning updated sessions.
 * @param {Array} sessions  array of session objects with .tabs
 * @returns {Array}
 */
function dedupeAcrossSessions(sessions) {
  const seen = new Set();
  return sessions.map(session => ({
    ...session,
    tabs: session.tabs.filter(tab => {
      if (seen.has(tab.url)) return false;
      seen.add(tab.url);
      return true;
    })
  }));
}

module.exports = { dedupeTabs, findDuplicates, dedupeAcrossSessions };
