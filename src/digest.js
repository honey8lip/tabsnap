// digest.js — generate a summary digest of sessions for reporting

const { formatDate, formatTabCount } = require('./format');
const { isFavorite } = require('./favorite');
const { isPinned } = require('./pin');
const { listAllTags } = require('./tag');

function buildDigest(sessions) {
  if (!sessions || sessions.length === 0) {
    return { total: 0, tabs: 0, favorites: 0, pinned: 0, tags: [], oldest: null, newest: null, avgTabs: 0 };
  }

  const totalTabs = sessions.reduce((sum, s) => sum + (s.tabs ? s.tabs.length : 0), 0);
  const favorites = sessions.filter(s => isFavorite(s)).length;
  const pinned = sessions.filter(s => isPinned(s)).length;
  const tags = listAllTags(sessions);

  const dates = sessions
    .map(s => s.savedAt || s.createdAt)
    .filter(Boolean)
    .map(d => new Date(d))
    .sort((a, b) => a - b);

  return {
    total: sessions.length,
    tabs: totalTabs,
    favorites,
    pinned,
    tags,
    oldest: dates.length ? dates[0].toISOString() : null,
    newest: dates.length ? dates[dates.length - 1].toISOString() : null,
    avgTabs: sessions.length ? Math.round(totalTabs / sessions.length) : 0
  };
}

function formatDigest(digest) {
  const lines = [
    `Sessions : ${digest.total}`,
    `Total tabs: ${digest.tabs} (avg ${digest.avgTabs} per session)`,
    `Favorites : ${digest.favorites}`,
    `Pinned    : ${digest.pinned}`,
    `Tags      : ${digest.tags.length > 0 ? digest.tags.join(', ') : '(none)'}`,
  ];

  if (digest.oldest) {
    lines.push(`Oldest    : ${formatDate(digest.oldest)}`);
  }
  if (digest.newest) {
    lines.push(`Newest    : ${formatDate(digest.newest)}`);
  }

  return lines.join('\n');
}

function digestSummaryLine(digest) {
  return `${digest.total} sessions, ${digest.tabs} tabs, ${digest.favorites} favorites`;
}

module.exports = { buildDigest, formatDigest, digestSummaryLine };
