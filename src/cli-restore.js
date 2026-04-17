#!/usr/bin/env node
import { restoreSession } from './restore.js';
import { listSessions } from './storage.js';

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  if (!command || command === '--help' || command === '-h') {
    console.log('Usage: tabsnap-restore <session-name> [--filter <keyword>]');
    console.log('       tabsnap-restore --list');
    process.exit(0);
  }

  if (command === '--list' || command === '-l') {
    const sessions = await listSessions();
    if (sessions.length === 0) {
      console.log('No saved sessions found.');
    } else {
      console.log('Saved sessions:');
      sessions.forEach(s => console.log(`  - ${s}`));
    }
    return;
  }

  const filterIdx = args.indexOf('--filter');
  const filter = filterIdx !== -1 ? args[filterIdx + 1] : undefined;

  if (filterIdx !== -1 && !filter) {
    console.error('Error: --filter requires a keyword argument');
    process.exit(1);
  }

  try {
    console.log(`Restoring session "${command}"...`);
    const result = await restoreSession(command, { filter });
    console.log(`✓ Opened ${result.restored} tab(s) in ${result.browser}`);
    if (result.skipped > 0) {
      console.log(`  Skipped ${result.skipped} tab(s) with no URL`);
    }
  } catch (err) {
    if (err.code === 'SESSION_NOT_FOUND') {
      console.error(`Error: Session "${command}" not found. Run --list to see available sessions.`);
    } else {
      console.error(`Error: ${err.message}`);
    }
    process.exit(1);
  }
}

main();
