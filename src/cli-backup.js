#!/usr/bin/env node
import { backupSession, listBackups, restoreBackup, pruneBackups, backupSummary } from './backup.js';
import { validateKeepCount } from './backup-utils.js';

const BACKUP_DIR = process.env.TABSNAP_BACKUP_DIR || `${process.env.HOME}/.tabsnap/backups`;
const SESSION_DIR = process.env.TABSNAP_DIR || `${process.env.HOME}/.tabsnap/sessions`;

function printUsage() {
  console.log('Usage: tabsnap backup <command> [args]');
  console.log('  create <name>           Backup a session');
  console.log('  list <name>             List backups for a session');
  console.log('  restore <backup> <name> Restore a backup to a session name');
  console.log('  prune <name> [keep]     Remove old backups, keep N most recent (default 5)');
}

const [,, , cmd, arg1, arg2] = process.argv;

async function main() {
  if (!cmd || cmd === '--help') return printUsage();

  if (cmd === 'create') {
    if (!arg1) { console.error('Session name required'); process.exit(1); }
    const name = await backupSession(arg1, BACKUP_DIR);
    console.log(`Backed up as: ${name}`);
  } else if (cmd === 'list') {
    if (!arg1) { console.error('Session name required'); process.exit(1); }
    const backups = await listBackups(arg1, BACKUP_DIR);
    console.log(backupSummary(backups));
  } else if (cmd === 'restore') {
    if (!arg1 || !arg2) { console.error('Backup name and target name required'); process.exit(1); }
    await restoreBackup(arg1, arg2, BACKUP_DIR, SESSION_DIR);
    console.log(`Restored ${arg1} -> ${arg2}`);
  } else if (cmd === 'prune') {
    if (!arg1) { console.error('Session name required'); process.exit(1); }
    const keep = arg2 ? validateKeepCount(arg2) : 5;
    const deleted = await pruneBackups(arg1, BACKUP_DIR, keep);
    console.log(`Pruned ${deleted.length} backup(s)`);
  } else {
    console.error(`Unknown command: ${cmd}`);
    printUsage();
    process.exit(1);
  }
}

main().catch(e => { console.error(e.message); process.exit(1); });
