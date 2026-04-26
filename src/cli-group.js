#!/usr/bin/env node
const { listSessions } = require('./storage');
const { groupByTag, groupByDate, groupByBrowser, formatGroupSummary } = require('./group');

function printUsage() {
  console.log('Usage: tabsnap group <by> [--detail]');
  console.log('  by: tag | date | browser');
}

function getGroups(by, sessions) {
  if (by === 'tag') return groupByTag(sessions);
  if (by === 'date') return groupByDate(sessions);
  if (by === 'browser') return groupByBrowser(sessions);
  return null;
}

async function main() {
  const args = process.argv.slice(2);
  const by = args[0];
  const detail = args.includes('--detail');

  if (!by || ['--help', '-h'].includes(by)) {
    printUsage();
    process.exit(0);
  }

  const sessions = await listSessions();
  if (Object.keys(sessions).length === 0) {
    console.log('No sessions found.');
    process.exit(0);
  }

  const groups = getGroups(by, sessions);
  if (!groups) {
    console.error(`Unknown grouping: ${by}`);
    printUsage();
    process.exit(1);
  }

  if (detail) {
    for (const [key, group] of Object.entries(groups)) {
      console.log(`\n[${key}]`);
      for (const name of Object.keys(group)) {
        console.log(`  - ${name}`);
      }
    }
  } else {
    console.log(formatGroupSummary(groups));
  }
}

main().catch(err => { console.error(err.message); process.exit(1); });
