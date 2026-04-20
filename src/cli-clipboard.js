#!/usr/bin/env node
import { loadSession } from './storage.js';
import { copyToClipboard, formatForClipboard } from './clipboard.js';

function printUsage() {
  console.log('Usage: tabsnap clipboard <session> [--format text|markdown|urls|json]');
  console.log('');
  console.log('Options:');
  console.log('  --format   Output format: text (default), markdown, urls, json');
  console.log('  --print    Print to stdout instead of copying');
}

async function main() {
  const args = process.argv.slice(2);

  if (!args.length || args.includes('--help')) {
    printUsage();
    process.exit(0);
  }

  const name = args[0];
  const formatIdx = args.indexOf('--format');
  const format = formatIdx !== -1 ? args[formatIdx + 1] : 'text';
  const printOnly = args.includes('--print');

  const validFormats = ['text', 'markdown', 'urls', 'json'];
  if (!validFormats.includes(format)) {
    console.error(`Unknown format: ${format}. Use one of: ${validFormats.join(', ')}`);
    process.exit(1);
  }

  let session;
  try {
    session = await loadSession(name);
  } catch {
    console.error(`Session not found: ${name}`);
    process.exit(1);
  }

  const output = formatForClipboard(session, format);

  if (printOnly) {
    console.log(output);
    return;
  }

  const ok = copyToClipboard(output);
  if (ok) {
    console.log(`Copied ${session.tabs.length} tabs from "${name}" to clipboard (${format})`);
  } else {
    console.error('Failed to copy to clipboard. Try --print to output to stdout.');
    process.exit(1);
  }
}

main();
