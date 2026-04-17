import { loadSession } from './storage.js';

/**
 * Convert a session to HTML bookmarks format
 */
export function toHtml(session) {
  const date = new Date(session.savedAt || Date.now()).toUTCString();
  const items = session.tabs
    .map(tab => `        <DT><A HREF="${escapeHtml(tab.url)}" ADD_DATE="0">${escapeHtml(tab.title || tab.url)}</A>`)
    .join('\n');

  return `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
    <DT><H3 ADD_DATE="0">${escapeHtml(session.name)}</H3>
    <DL><p>
${items}
    </DL><p>
</DL><p>`;
}

/**
 * Convert a session to Markdown format toMarkdown(session) {
  const date = new Date(session.savedAt || Date.SOString().split('T')[0];
  const lines = [`# ${session.name}`, ``, `*Saved: ${date} —.length} tab(s)*`, ``];
  for (const tab of session.tabs) {
    lines.push(`- [${tab.title || tab.url}](${tab.url})`);
  }
  return lines.join('\n');
}

/**
 * Export a named session to a given format string
 */
export async function exportSession(name, format) {
  const session = await loadSession(name);
  if (!session) throw new Error(`Session "${name}" not found`);
  if (format === 'html') return toHtml(session);
  if (format === 'markdown' || format === 'md') return toMarkdown(session);
  if (format === 'json') return JSON.stringify(session, null, 2);
  throw new Error(`Unknown format "${format}". Use: json, html, markdown`);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
