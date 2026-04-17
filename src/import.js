import { parse } from 'node-html-parser';
import { saveSession } from './storage.js';

/**
 * Parse an HTML bookmarks file into a flat list of tabs
 */
export function parseHtmlBookmarks(html) {
  const root = parse(html);
  const links = root.querySelectorAll('a');
  return links
    .map(a => ({ url: a.getAttribute('href'), title: a.text.trim() }))
    .filter(t => t.url && t.url.startsWith('http'));
}

/**
 * Parse a simple markdown link list into tabs
 */
export function parseMarkdown(md) {
  const linkRe = /^\s*[-*]\s+\[([^\]]+)\]\(([^)]+)\)/gm;
  const tabs = [];
  let match;
  while ((match = linkRe.exec(md)) !== null) {
    const [, title, url] = match;
    if (url.startsWith('http')) tabs.push({ title, url });
  }
  return tabs;
}

/**
 * Import tabs from content string into a named session
 */
export async function importSession(name, content, format) {
  let tabs;
  if (format === 'html') {
    tabs = parseHtmlBookmarks(content);
  } else if (format === 'markdown' || format === 'md') {
    tabs = parseMarkdown(content);
  } else if (format === 'json') {
    const parsed = JSON.parse(content);
    tabs = Array.isArray(parsed) ? parsed : parsed.tabs;
    if (!Array.isArray(tabs)) throw new Error('JSON must be an array or object with a tabs array');
  } else {
    throw new Error(`Unknown format "${format}". Use: json, html, markdown`);
  }

  if (tabs.length === 0) throw new Error('No valid tabs found in input');

  const session = { name, savedAt: new Date().toISOString(), tabs, browser: 'imported' };
  await saveSession(name, session);
  return { name, count: tabs.length };
}
