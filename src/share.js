const { formatTabsAsMarkdown } = require('./clipboard');

function buildSharePayload(session, options = {}) {
  const { includeDate = true, includeBrowser = true } = options;
  const tabs = session.tabs || [];
  const meta = [];
  if (includeBrowser && session.browser) meta.push(`Browser: ${session.browser}`);
  if (includeDate && session.savedAt) meta.push(`Saved: ${session.savedAt}`);
  return {
    name: session.name,
    tabs,
    meta,
    tabCount: tabs.length,
  };
}

function formatShareText(session, options = {}) {
  const payload = buildSharePayload(session, options);
  const lines = [`# ${payload.name}`, ''];
  if (payload.meta.length) {
    lines.push(...payload.meta, '');
  }
  lines.push(formatTabsAsMarkdown(payload.tabs));
  return lines.join('\n');
}

function formatShareUrl(session, baseUrl = 'https://tabsnap.app/share') {
  const data = encodeURIComponent(JSON.stringify({
    name: session.name,
    tabs: (session.tabs || []).map(t => ({ title: t.title, url: t.url })),
  }));
  return `${baseUrl}?data=${data}`;
}

function shareableSummary(session) {
  const count = (session.tabs || []).length;
  return `${session.name} — ${count} tab${count !== 1 ? 's' : ''}`;
}

module.exports = { buildSharePayload, formatShareText, formatShareUrl, shareableSummary };
