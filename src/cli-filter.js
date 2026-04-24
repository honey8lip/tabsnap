#!/usr/bin/env node
// tabsnap filter -- filter saved sessions and print matching names

const { listSessions, loadSession } = require('./storage');
const { applyFilters } = require('./filter');

function printUsage() {
  console.log('Usage: tabsnap filter [options]');
  console.log('  --browser <name>    filter by browser');
  console.log('  --from <date>       filter by start date (ISO)');
  console.log('  --to <date>         filter by end date (ISO)');
  console.log('  --min-tabs <n>      minimum tab count');
  console.log('  --max-tabs <n>      maximum tab count');
  console.log('  --domain <host>     sessions containing domain');
}

function formatSessionLine(s) {
  const tabCount = Array.isArray(s.tabs) ? s.tabs.length : 0;
  const tabLabel = tabCount === 1 ? '1 tab' : `${tabCount} tabs`;
  const browser = s.browser || 'unknown';
  const date = s.savedAt ? new Date(s.savedAt).toLocaleString() : 'no date';
  return `${s.name}  [${tabLabel}]  ${browser}  ${date}`;
}

async function main(argv) {
  const args = argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    printUsage();
    return;
  }

  const opts = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--browser') opts.browser = args[++i];
    else if (args[i] === '--from') opts.from = args[++i];
    else if (args[i] === '--to') opts.to = args[++i];
    else if (args[i] === '--min-tabs') opts.minTabs = parseInt(args[++i], 10);
    else if (args[i] === '--max-tabs') opts.maxTabs = parseInt(args[++i], 10);
    else if (args[i] === '--domain') opts.domain = args[++i];
  }

  const names = await listSessions();
  const sessions = [];
  for (const name of names) {
    try {
      const s = await loadSession(name);
      sessions.push({ ...s, name });
    } catch {}
  }

  const results = applyFilters(sessions, opts);
  if (results.length === 0) {
    console.log('No sessions match the given filters.');
    return;
  }
  for (const s of results) {
    console.log(formatSessionLine(s));
  }
}

main(process.argv).catch(e => { console.error(e.message); process.exit(1); });
