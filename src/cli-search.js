#!/usr/bin/env node
import { listSessions, loadSession } from './storage.js';
import { searchSessions, formatSearchResults } from './search.js';

function printUsage() {
  console.log('Usage: tabsnap search <query>');
  console.log('  Search all saved sessions for tabs matching a keyword.');
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args[0] === '--help') {
    printUsage();
    process.exit(0);
  }

  const query = args.join(' ');

  let names;
  try {
    names = await listSessions();
  } catch (err) {
    console.error('Failed to list sessions:', err.message);
    process.exit(1);
  }

  if (names.length === 0) {
    console.log('No saved sessions found.');
    process.exit(0);
  }

  const sessions = [];
  for (const name of names) {
    try {
      const session = await loadSession(name);
      sessions.push({ ...session, name });
    } catch {
      // skip unreadable sessions
    }
  }

  const results = searchSessions(sessions, query);
  console.log(formatSearchResults(results, query));
}

main();
