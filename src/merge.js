// merge.js — combine multiple sessions into one

/**
 * Merge multiple sessions into a single session.
 * Tabs are combined in order; duplicates optionally removed.
 */
function mergeSessions(sessions, { dedupe = false, label } = {}) {
  if (!Array.isArray(sessions) || sessions.length === 0) {
    throw new Error('No sessions provided to merge');
  }

  const allTabs = [];
  const seen = new Set();

  for (const session of sessions) {
    if (!session || !Array.isArray(session.tabs)) {
      throw new Error('Invalid session format: missing tabs array');
    }
    for (const tab of session.tabs) {
      if (dedupe) {
        if (!seen.has(tab.url)) {
          seen.add(tab.url);
          allTabs.push(tab);
        }
      } else {
        allTabs.push(tab);
      }
    }
  }

  const names = sessions.map(s => s.name).filter(Boolean);
  const mergedName = label || names.join('+') || 'merged';

  return {
    name: mergedName,
    date: new Date().toISOString(),
    tabs: allTabs,
    tags: Array.from(
      new Set(sessions.flatMap(s => s.tags || []))
    ),
  };
}

/**
 * Produce a summary diff: how many tabs came from each source session.
 */
function mergeSummary(sessions, merged) {
  return sessions.map(s => ({
    name: s.name || '(unnamed)',
    contributed: (s.tabs || []).filter(t =>
      merged.tabs.some(m => m.url === t.url)
    ).length,
  }));
}

module.exports = { mergeSessions, mergeSummary };
