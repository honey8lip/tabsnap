import { detectBrowser, parseTabs, formatSession } from './browser.js';
import { saveSession } from './storage.js';

/**
 * Capture tabs from a JSON file (exported manually from browser extension)
 * or from a raw array passed programmatically.
 */
export async function captureFromFile(filePath, sessionName, options = {}) {
  const { readFile } = await import('fs/promises');
  const raw = await readFile(filePath, 'utf-8');
  let parsed;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Failed to parse JSON from file: ${filePath}`);
  }

  const tabArray = Array.isArray(parsed) ? parsed : parsed.tabs;
  if (!tabArray) {
    throw new Error('Could not find tabs array in file. Expected root array or { tabs: [] }');
  }

  const browser = options.browser || parsed.browser || detectBrowser() || 'unknown';
  const tabs = parseTabs(tabArray);
  const session = formatSession(tabs, browser);

  await saveSession(sessionName, session);
  return session;
}

export async function captureFromArray(tabArray, sessionName, options = {}) {
  const browser = options.browser || detectBrowser() || 'unknown';
  const tabs = parseTabs(tabArray);
  const session = formatSession(tabs, browser);

  await saveSession(sessionName, session);
  return session;
}

export function summarize(session) {
  const lines = [
    `Browser : ${session.browser}`,
    `Saved   : ${session.savedAt}`,
    `Tabs    : ${session.tabCount}`,
    '',
    ...session.tabs.map((t, i) => `  ${i + 1}. [${t.pinned ? 'P' : ' '}] ${t.title} — ${t.url}`),
  ];
  return lines.join('\n');
}
