import { listSessions, loadSession } from './storage.js';

export async function sessionStats(name) {
  const session = await loadSession(name);
  const tabs = session.tabs || [];
  const domains = tabs.map(t => {
    try { return new URL(t.url).hostname; } catch { return 'unknown'; }
  });
  const domainCounts = domains.reduce((acc, d) => {
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {});
  return {
    name,
    tabCount: tabs.length,
    uniqueDomains: Object.keys(domainCounts).length,
    topDomains: Object.entries(domainCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([domain, count]) => ({ domain, count })),
    createdAt: session.createdAt || null,
    tags: session.tags || [],
    pinned: session.pinned || false,
  };
}

export async function globalStats() {
  const names = await listSessions();
  let totalTabs = 0;
  const domainMap = {};
  const tagMap = {};
  let pinnedCount = 0;

  for (const name of names) {
    const session = await loadSession(name);
    const tabs = session.tabs || [];
    totalTabs += tabs.length;
    if (session.pinned) pinnedCount++;
    for (const tag of session.tags || []) {
      tagMap[tag] = (tagMap[tag] || 0) + 1;
    }
    for (const tab of tabs) {
      try {
        const domain = new URL(tab.url).hostname;
        domainMap[domain] = (domainMap[domain] || 0) + 1;
      } catch { /* skip */ }
    }
  }

  return {
    sessionCount: names.length,
    totalTabs,
    avgTabsPerSession: names.length ? +(totalTabs / names.length).toFixed(1) : 0,
    pinnedCount,
    topDomains: Object.entries(domainMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([domain, count]) => ({ domain, count })),
    topTags: Object.entries(tagMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count })),
  };
}
