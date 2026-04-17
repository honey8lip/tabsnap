#!/usr/bin/env node
'use strict';

const { listSessions, loadSession } = require('./storage');

async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose') || args.includes('-v');

  let sessions;
  try {
    sessions = await listSessions();
  } catch (err) {
    console.error('Failed to list sessions:', err.message);
    process.exit(1);
  }

  if (sessions.length === 0) {
    console.log('No saved sessions found.');
    return;
  }

  console.log(`Found ${sessions.length} session(s):\n`);

  for (const name of sessions) {
    if (verbose) {
      try {
        const session = await loadSession(name);
        const count = session.tabs ? session.tabs.length : 0;
        const browser = session.browser || 'unknown';
        const saved = session.savedAt ? new Date(session.savedAt).toLocaleString() : 'unknown';
        console.log(`  ${name}`);
        console.log(`    browser : ${browser}`);
        console.log(`    tabs    : ${count}`);
        console.log(`    saved   : ${saved}`);
      } catch {
        console.log(`  ${name} (could not load details)`);
      }
    } else {
      console.log(`  ${name}`);
    }
  }
}

main();
