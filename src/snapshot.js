import { formatSession } from './browser.js';
import { saveSession } from './storage.js';
import { addTags } from './tag.js';

export function createSnapshot(tabs, { name, tags = [], browser = 'chrome' } = {}) {
  const session = formatSession(tabs, { name, browser });
  return session;
}

export function snapshotWithMeta(tabs, options = {}) {
  const session = createSnapshot(tabs, options);
  const { tags = [], notes = '' } = options;

  if (tags.length > 0) {
    addTags(session, tags);
  }

  if (notes) {
    session.notes = notes;
  }

  session.snapshotAt = new Date().toISOString();
  return session;
}

export async function saveSnapshot(tabs, options = {}) {
  const session = snapshotWithMeta(tabs, options);
  await saveSession(session.name, session);
  return session;
}

export function diffSnapshots(a, b) {
  const aUrls = new Set(a.tabs.map(t => t.url));
  const bUrls = new Set(b.tabs.map(t => t.url));

  const added = b.tabs.filter(t => !aUrls.has(t.url));
  const removed = a.tabs.filter(t => !bUrls.has(t.url));
  const kept = b.tabs.filter(t => aUrls.has(t.url));

  return { added, removed, kept };
}
