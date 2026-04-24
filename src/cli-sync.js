#!/usr/bin/env node
import { writeFileSync } from 'fs';
import { listSessions } from './storage.js';
import { exportSyncBundle, importSyncBundle, formatSyncReport } from './sync.js';
import { parseSyncTarget, validateBundle, readBundleFile, bundleSummary } from './sync-utils.js';

const DIR = process.env.TABSNAP_DIR || `${process.env.HOME}/.tabsnap`;

function printUsage() {
  console.log('Usage: tabsnap sync <export|import|status> [options]');
  console.log('  export <file>          Export all sessions to a sync bundle file');
  console.log('  import <file>          Import sessions from a sync bundle file');
  console.log('  import --overwrite     Overwrite existing sessions on import');
  console.log('  status <file>          Show summary of a bundle file');
}

async function main() {
  const [,, , sub, target, ...flags] = process.argv;
  const overwrite = flags.includes('--overwrite');

  if (!sub || sub === '--help') {
    printUsage();
    process.exit(0);
  }

  if (sub === 'export') {
    if (!target) { console.error('Provide output file path'); process.exit(1); }
    const names = await listSessions(DIR);
    if (!names.length) { console.log('No sessions to export.'); return; }
    const bundle = await exportSyncBundle(names, DIR);
    writeFileSync(target, JSON.stringify(bundle, null, 2));
    console.log(`Exported ${names.length} session(s) to ${target}`);
    return;
  }

  if (sub === 'import') {
    if (!target) { console.error('Provide bundle file path'); process.exit(1); }
    const parsed = parseSyncTarget(target);
    if (parsed.type !== 'file') { console.error('Only file:// targets supported currently'); process.exit(1); }
    let bundle;
    try { bundle = readBundleFile(parsed.path); } catch (e) { console.error(e.message); process.exit(1); }
    const err = validateBundle(bundle);
    if (err) { console.error(`Invalid bundle: ${err}`); process.exit(1); }
    const results = await importSyncBundle(bundle, DIR, { overwrite });
    console.log(formatSyncReport(results));
    return;
  }

  if (sub === 'status') {
    if (!target) { console.error('Provide bundle file path'); process.exit(1); }
    let bundle;
    try { bundle = readBundleFile(target); } catch (e) { console.error(e.message); process.exit(1); }
    const err = validateBundle(bundle);
    if (err) { console.error(`Invalid bundle: ${err}`); process.exit(1); }
    console.log(bundleSummary(bundle));
    return;
  }

  console.error(`Unknown subcommand: ${sub}`);
  printUsage();
  process.exit(1);
}

main();
