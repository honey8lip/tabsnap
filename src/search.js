// Search sessions by URL or title keywords

export function searchTabs(session, query) {
  const q = query.toLowerCase();
  return session.tabs.filter(tab => {
    const inUrl = tab.url && tab.url.toLowerCase().includes(q);
    const inTitle = tab.title && tab.title.toLowerCase().includes(q);
    return inUrl || inTitle;
  });
}

export function searchSessions(sessions, query) {
  const results = [];
  for (const session of sessions) {
    const matched = searchTabs(session, query);
    if (matched.length > 0) {
      results.push({ ...session, tabs: matched, _matchCount: matched.length });
    }
  }
  return results.sort((a, b) => b._matchCount - a._matchCount);
}

export function formatSearchResults(results, query) {
  if (results.length === 0) {
    return `No sessions found matching "${query}"`;
  }
  const lines = [`Search results for "${query}":\n`];
  for (const session of results) {
    lines.push(`  [${session.name}] — ${session._matchCount} match(es)`);
    for (const tab of session.tabs) {
      lines.push(`    • ${tab.title || '(no title)'}`);
      lines.push(`      ${tab.url}`);
    }
  }
  return lines.join('\n');
}
