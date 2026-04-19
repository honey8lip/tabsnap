#!/usr/bin/env node
import { parseTabs, detectBrowser } from './browser.js';
import { saveSnapshot, diffSnapshots } from './snapshot.js';
import { loadSession, listSessions } from './storage.js';

function printUsage() {
  console.log('Usage: tabsnap snapshot [--name <name>] [--tags <t1,t2>] [--notes <text>] [--diff <other>]');
}

const args = process.argv.slice(2);
if (args.includes('--help')) { printUsage(); process.exit(0); }

const nameIdx = args.indexOf('--name');
const tagsIdx = args.indexOf('--tags');
const notesIdx = args.indexOf('--notes');
const diffIdx = args.indexOf('--diff');

const name = nameIdx !== -1 ? args[nameIdx + 1] : `snapshot-${Date.now()}`;
const tags = tagsIdx !== -1 ? args[tagsIdx + 1].split(',') : [];
const notes = notesIdx !== -1 ? args[notesIdx + 1] : '';
const diffTarget = diffIdx !== -1 ? args[diffIdx + 1] : null;

const browser = detectBrowser();
const rawTabs = parseTabs(browser);

(async () => {
  const session = await saveSnapshot(rawTabs, { name, tags, notes, browser });
  console.log(`Snapshot saved: ${session.name} (${session.tabs.length} tabs)`);

  if (diffTarget) {
    try {
      const other = await loadSession(diffTarget);
      const diff = diffSnapshots(other, session);
      console.log(`Diff vs "${diffTarget}": +${diff.added.length} added, -${diff.removed.length} removed, ${diff.kept.length} kept`);
    } catch {
      console.error(`Could not load session "${diffTarget}" for diff`);
    }
  }
})();
