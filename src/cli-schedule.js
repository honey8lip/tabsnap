#!/usr/bin/env node
import { setSchedule, removeSchedule, loadSchedule, runDue } from './schedule.js';

const SESSIONS_DIR = process.env.TABSNAP_DIR || `${process.env.HOME}/.tabsnap/sessions`;

function printUsage() {
  console.log('Usage: tabsnap schedule <command> [args]');
  console.log('Commands:');
  console.log('  add <name> <minutes>   Auto-save session every N minutes');
  console.log('  remove <name>          Remove a schedule');
  console.log('  list                   Show all schedules');
  console.log('  run                    Run all due schedules now');
}

async function main() {
  const [,, , cmd, ...args] = process.argv;

  if (!cmd || cmd === '--help') {
    printUsage();
    process.exit(0);
  }

  if (cmd === 'add') {
    const [name, minutes] = args;
    if (!name || !minutes) { printUsage(); process.exit(1); }
    const entry = setSchedule(name, parseInt(minutes, 10));
    console.log(`Scheduled "${entry.name}" every ${entry.intervalMinutes} minutes.`);

  } else if (cmd === 'remove') {
    const [name] = args;
    if (!name) { printUsage(); process.exit(1); }
    removeSchedule(name);
    console.log(`Removed schedule: ${name}`);

  } else if (cmd === 'list') {
    const schedule = loadSchedule();
    const entries = Object.values(schedule);
    if (!entries.length) { console.log('No schedules set.'); return; }
    for (const e of entries) {
      const last = e.lastRun ? new Date(e.lastRun).toLocaleString() : 'never';
      console.log(`  ${e.name}: every ${e.intervalMinutes}min, last run: ${last}`);
    }

  } else if (cmd === 'run') {
    const results = await runDue(SESSIONS_DIR);
    if (!results.length) { console.log('Nothing due.'); return; }
    for (const r of results) {
      if (r.success) console.log(`  ✓ ${r.name} — ${r.tabCount} tabs saved`);
      else console.error(`  ✗ ${r.name} — ${r.error}`);
    }

  } else {
    console.error(`Unknown command: ${cmd}`);
    printUsage();
    process.exit(1);
  }
}

main();
