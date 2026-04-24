// format.js — output formatting helpers for sessions and tabs

function formatDate(isoString) {
  if (!isoString) return 'unknown';
  const d = new Date(isoString);
  return d.toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function formatTabCount(n) {
  return `${n} tab${n === 1 ? '' : 's'}`;
}

function formatSessionLine(session, opts = {}) {
  const { showDate = true, showBrowser = true, showTags = false } = opts;
  const parts = [session.name];
  if (showBrowser && session.browser) parts.push(`[${session.browser}]`);
  if (showDate && session.savedAt) parts.push(`(${formatDate(session.savedAt)})`);
  parts.push(`— ${formatTabCount(session.tabs ? session.tabs.length : 0)}`);
  if (showTags && session.tags && session.tags.length > 0) {
    parts.push(`#${session.tags.join(' #')}`);
  }
  return parts.join(' ');
}

function formatTabLine(tab, index) {
  const prefix = index !== undefined ? `  ${index + 1}. ` : '  - ';
  const title = tab.title ? tab.title : '(no title)';
  return `${prefix}${title}\n     ${tab.url}`;
}

function formatSessionDetail(session) {
  const lines = [];
  lines.push(`Name   : ${session.name}`);
  if (session.browser) lines.push(`Browser: ${session.browser}`);
  if (session.savedAt) lines.push(`Saved  : ${formatDate(session.savedAt)}`);
  if (session.tags && session.tags.length > 0) lines.push(`Tags   : ${session.tags.join(', ')}`);
  if (session.notes) lines.push(`Notes  : ${session.notes}`);
  lines.push(`Tabs   : ${formatTabCount(session.tabs ? session.tabs.length : 0)}`);
  if (session.tabs && session.tabs.length > 0) {
    lines.push('');
    session.tabs.forEach((tab, i) => lines.push(formatTabLine(tab, i)));
  }
  return lines.join('\n');
}

function formatList(sessions, opts = {}) {
  if (!sessions || sessions.length === 0) return '(no sessions)';
  return sessions.map(s => formatSessionLine(s, opts)).join('\n');
}

module.exports = { formatDate, formatTabCount, formatSessionLine, formatTabLine, formatSessionDetail, formatList };
