// preview.js — format a session for human-readable terminal preview

const { formatDate, formatTabCount } = require('./format');
const { colorize, bold, dim, cyan, green } = require('./color');

function previewSession(session, opts = {}) {
  const { maxTabs = 10, showIndex = true, color = true } = opts;
  const lines = [];

  const name = bold(session.name || '(unnamed)', color);
  const date = dim(formatDate(session.savedAt || session.createdAt), color);
  const browser = session.browser ? colorize(session.browser, 'magenta', color) : dim('unknown', color);
  const tabCount = formatTabCount(session.tabs ? session.tabs.length : 0);

  lines.push(`${name}  ${date}  ${browser}  ${tabCount}`);

  if (session.tags && session.tags.length > 0) {
    const tagStr = session.tags.map(t => green(`#${t}`, color)).join(' ');
    lines.push(`  tags: ${tagStr}`);
  }

  if (session.notes) {
    lines.push(`  notes: ${dim(session.notes.slice(0, 80), color)}`);
  }

  const tabs = session.tabs || [];
  const shown = tabs.slice(0, maxTabs);
  const hidden = tabs.length - shown.length;

  shown.forEach((tab, i) => {
    const idx = showIndex ? dim(`${i + 1}.`, color) + ' ' : '';
    const title = tab.title ? tab.title.slice(0, 60) : dim('(no title)', color);
    const url = dim(tab.url ? tab.url.slice(0, 70) : '', color);
    lines.push(`  ${idx}${cyan(title, color)}`);
    lines.push(`     ${url}`);
  });

  if (hidden > 0) {
    lines.push(`  ${dim(`… and ${hidden} more tab${hidden !== 1 ? 's' : ''}`, color)}`);
  }

  return lines.join('\n');
}

function previewSummaryLine(session, color = true) {
  const name = (session.name || '(unnamed)').padEnd(24);
  const date = formatDate(session.savedAt || session.createdAt).padEnd(20);
  const tabs = formatTabCount(session.tabs ? session.tabs.length : 0).padEnd(12);
  const browser = (session.browser || 'unknown').padEnd(10);
  return `${bold(name, color)} ${dim(date, color)} ${tabs} ${dim(browser, color)}`;
}

module.exports = { previewSession, previewSummaryLine };
