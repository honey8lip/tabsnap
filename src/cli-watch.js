#!/usr/bin/env node
import { createWatcher } from './watch.js';
import { detectBrowser, parseTabs, formatSession } from './browser.js';
import { summarize } from './capture.js';
import { formatDiff } from './diff.js';

function printUsage() {
  console.log('Usage: tabsnap watch <session-name> [--interval <seconds>]');
  console.log('');
  console.log('Options:');
  console.log('  --interval <seconds>   Poll interval in seconds (default: 60)');
  console.log('  --quiet                Suppress change output');
}

async function captureCurrentTabs() {
  const browser = detectBrowser();
  const raw = parseTabs(browser);
  return formatSession(raw, browser);
}

export async function main(argv) {
  const args = argv.slice(2);
  if (!args.length || args[0] === '--help') {
    printUsage();
    process.exit(0);
  }

  const name = args[0];
  let intervalMs = 60_000;
  let quiet = false;

  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--interval' && args[i + 1]) {
      intervalMs = parseInt(args[++i], 10) * 1000;
    } else if (args[i] === '--quiet') {
      quiet = true;
    }
  }

  console.log(`Watching session "${name}" every ${intervalMs / 1000}s. Ctrl+C to stop.`);

  const watcher = createWatcher(name, captureCurrentTabs, {
    intervalMs,
    onChange(diff, session) {
      if (quiet) return;
      console.log(`[${new Date().toISOString()}] Changes detected:`);
      console.log(formatDiff(diff));
      const s = summarize(session);
      console.log(`  Total tabs: ${s.tabCount}`);
    },
    onError(err) {
      console.error('Watch error:', err.message);
    },
  });

  await watcher.start();

  process.on('SIGINT', () => {
    watcher.stop();
    console.log('\nWatcher stopped.');
    process.exit(0);
  });
}

main(process.argv);
