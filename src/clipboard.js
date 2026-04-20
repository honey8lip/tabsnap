import { execSync } from 'child_process';
import os from 'os';

export function copyToClipboard(text) {
  const platform = os.platform();
  try {
    if (platform === 'darwin') {
      execSync('pbcopy', { input: text });
    } else if (platform === 'win32') {
      execSync('clip', { input: text });
    } else {
      execSync('xclip -selection clipboard', { input: text });
    }
    return true;
  } catch {
    return false;
  }
}

export function formatTabsAsText(session) {
  const lines = [`Session: ${session.name}`, ''];
  for (const tab of session.tabs) {
    lines.push(`${tab.title}`);
    lines.push(`  ${tab.url}`);
  }
  return lines.join('\n');
}

export function formatTabsAsMarkdown(session) {
  const lines = [`# ${session.name}`, ''];
  for (const tab of session.tabs) {
    const title = tab.title || tab.url;
    lines.push(`- [${title}](${tab.url})`);
  }
  return lines.join('\n');
}

export function formatTabsAsUrls(session) {
  return session.tabs.map(t => t.url).join('\n');
}

export function formatForClipboard(session, format = 'text') {
  switch (format) {
    case 'markdown': return formatTabsAsMarkdown(session);
    case 'urls': return formatTabsAsUrls(session);
    case 'json': return JSON.stringify(session.tabs, null, 2);
    default: return formatTabsAsText(session);
  }
}
