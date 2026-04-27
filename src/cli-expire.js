#!/usr/bin/env node
import { findExpired, purgeExpired, setExpiry, clearExpiry, expirySummary } from './expire.js';
import { loadSession } from './storage.js';

const SESSION_DIR = process.env.TABSNAP_DIR || `${process.env.HOME}/.tabsnap`;
const DAY = 86400000;

function printUsage() {
  console.log('Usage: tabsnap expire <command> [options]');
  console.log('');
  console.log('Commands:');
  console.log('  list [--days <n>]         List sessions older than n days (default: 30)');
  console.log('  purge [--days <n>]        Delete sessions older than n days');
  console.log('  set <name> <YYYY-MM-DD>   Set explicit expiry date on a session');
  console.log('  clear <name>              Remove expiry date from a session');
  console.log('  info <name>               Show expiry info for a session');
}

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];

  const daysIdx = args.indexOf('--days');
  const days = daysIdx !== -1 ? parseInt(args[daysIdx + 1], 10) : 30;
  const ttl = days * DAY;

  if (!cmd || cmd === '--help' || cmd === '-h') {
    printUsage();
    process.exit(0);
  }

  if (cmd === 'list') {
    const expired = await findExpired(SESSION_DIR, ttl);
    if (expired.length === 0) {
      console.log(`No sessions older than ${days} days.`);
      return;
    }
    console.log(`Sessions older than ${days} days:`);
    for (const { name, session } of expired) {
      console.log(`  ${name}  (${expirySummary(session)})`);
    }
    return;
  }

  if (cmd === 'purge') {
    const deleted = await purgeExpired(SESSION_DIR, ttl);
    if (deleted.length === 0) {
      console.log(`Nothing to purge (threshold: ${days} days).`);
    } else {
      console.log(`Purged ${deleted.length} session(s): ${deleted.join(', ')}`);
    }
    return;
  }

  if (cmd === 'set') {
    const name = args[1];
    const dateStr = args[2];
    if (!name || !dateStr) { printUsage(); process.exit(1); }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) { console.error('Invalid date:', dateStr); process.exit(1); }
    await setExpiry(SESSION_DIR, name, d);
    console.log(`Expiry for "${name}" set to ${d.toLocaleDateString()}.`);
    return;
  }

  if (cmd === 'clear') {
    const name = args[1];
    if (!name) { printUsage(); process.exit(1); }
    await clearExpiry(SESSION_DIR, name);
    console.log(`Expiry cleared for "${name}".`);
    return;
  }

  if (cmd === 'info') {
    const name = args[1];
    if (!name) { printUsage(); process.exit(1); }
    const session = await loadSession(SESSION_DIR, name);
    console.log(`${name}: ${expirySummary(session)}`);
    return;
  }

  console.error(`Unknown command: ${cmd}`);
  printUsage();
  process.exit(1);
}

main().catch(e => { console.error(e.message); process.exit(1); });
