import { loadSession } from './storage.js';
import { detectBrowser, isRunning } from './browser.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function openTabs(urls, browser) {
  const browserInfo = browser || detectBrowser();
  if (!browserInfo) throw new Error('No supported browser detected');

  const running = await isRunning(browserInfo.name);

  for (const url of urls) {
    const cmd = buildOpenCommand(url, browserInfo, running);
    await execAsync(cmd);
    // small delay to avoid overwhelming the browser
    await new Promise(r => setTimeout(r, 150));
  }

  return { browser: browserInfo.name, count: urls.length };
}

function buildOpenCommand(url, browserInfo, running) {
  const escaped = url.replace(/"/g, '\\"');
  if (process.platform === 'darwin') {
    return `open -a "${browserInfo.appName}" "${escaped}"`;
  } else if (process.platform === 'win32') {
    return `start "" "${browserInfo.exe}" "${escaped}"`;
  } else {
    return `${browserInfo.bin} "${escaped}"`;
  }
}

export async function restoreSession(name, options = {}) {
  const session = await loadSession(name);
  if (!session) throw new Error(`Session "${name}" not found`);

  const tabs = session.tabs || [];
  if (tabs.length === 0) {
    return { restored: 0, skipped: 0 };
  }

  let urls = tabs.map(t => t.url).filter(Boolean);

  if (options.filter) {
    urls = urls.filter(u => u.includes(options.filter));
  }

  const skipped = tabs.length - urls.length;
  const result = await openTabs(urls, options.browser);

  return { restored: result.count, skipped, browser: result.browser };
}
