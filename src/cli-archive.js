#!/usr/bin/env node
import path from 'node:path';
import os from 'node:os';
import { archiveSession, unarchiveSession, listArchived, purgeArchive } from './archive.js';

const SESSIONS_DIR = path.join(os.homedir(), '.tabsnap', 'sessions');
const ARCHIVE_DIR = path.join(os.homedir(), '.tabsnap', 'archive');

function printUsage() {
  console.log('Usage: tabsnap archive <command> [name]');
  console.log('Commands:');
  console.log('  save <name>      Archive a session');
  console.log('  restore <name>   Restore an archived session');
  console.log('  list             List archived sessions');
  console.log('  purge            Delete all archived sessions');
}

const [,, , cmd, name] = process.argv;

if (!cmd) { printUsage(); process.exit(1); }

try {
  if (cmd === 'save') {
    if (!name) { console.error('Session name required'); process.exit(1); }
    const archived = await archiveSession(name, SESSIONS_DIR, ARCHIVE_DIR);
    console.log(`Archived as: ${archived}`);
  } else if (cmd === 'restore') {
    if (!name) { console.error('Archive name required'); process.exit(1); }
    const restored = await unarchiveSession(name, ARCHIVE_DIR, SESSIONS_DIR);
    console.log(`Restored as: ${restored}`);
  } else if (cmd === 'list') {
    const sessions = await listArchived(ARCHIVE_DIR);
    if (sessions.length === 0) { console.log('No archived sessions.'); }
    else sessions.forEach(s => console.log(s));
  } else if (cmd === 'purge') {
    const count = await purgeArchive(ARCHIVE_DIR);
    console.log(`Purged ${count} archived session(s).`);
  } else {
    console.error(`Unknown command: ${cmd}`);
    printUsage();
    process.exit(1);
  }
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}
