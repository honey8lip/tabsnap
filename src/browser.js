import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

const SUPPORTED_BROWSERS = ['chrome', 'firefox', 'brave', 'edge'];

export function detectBrowser() {
  const platform = process.platform;

  if (platform === 'darwin') {
    if (isRunning('Google Chrome')) return 'chrome';
    if (isRunning('Brave Browser')) return 'brave';
    if (isRunning('Firefox')) return 'firefox';
    if (isRunning('Microsoft Edge')) return 'edge';
  } else if (platform === 'linux') {
    if (isRunning('google-chrome')) return 'chrome';
    if (isRunning('firefox')) return 'firefox';
    if (isRunning('brave-browser')) return 'brave';
  } else if (platform === 'win32') {
    if (isRunning('chrome.exe')) return 'chrome';
    if (isRunning('firefox.exe')) return 'firefox';
    if (isRunning('brave.exe')) return 'brave';
    if (isRunning('msedge.exe')) return 'edge';
  }

  return null;
}

function isRunning(processName) {
  try {
    const cmd = process.platform === 'win32'
      ? `tasklist /FI "IMAGENAME eq ${processName}" 2>NUL`
      : `pgrep -x "${processName}" 2>/dev/null`;
    const result = execSync(cmd, { stdio: 'pipe' }).toString();
    return result.trim().length > 0;
  } catch {
    return false;
  }
}

export function parseTabs(rawTabs) {
  if (!Array.isArray(rawTabs)) {
    throw new Error('Expected an array of tabs');
  }

  return rawTabs
    .filter(tab => tab && typeof tab.url === 'string' && tab.url.startsWith('http'))
    .map(tab => ({
      title: tab.title || 'Untitled',
      url: tab.url,
      pinned: tab.pinned || false,
    }));
}

export function formatSession(tabs, browser = 'unknown') {
  return {
    browser,
    savedAt: new Date().toISOString(),
    tabCount: tabs.length,
    tabs,
  };
}

/**
 * Returns a deduplicated list of tabs based on URL.
 * If multiple tabs share the same URL, only the first occurrence is kept.
 */
export function deduplicateTabs(tabs) {
  const seen = new Set();
  return tabs.filter(tab => {
    if (seen.has(tab.url)) return false;
    seen.add(tab.url);
    return true;
  });
}

export { SUPPORTED_BROWSERS };
