#!/usr/bin/env node
const { loadSession } = require('./storage');
const { formatShareText, formatShareUrl, shareableSummary } = require('./share');
const { copyToClipboard } = require('./clipboard');

function printUsage() {
  console.log('Usage: tabsnap share <name> [--url] [--copy] [--no-date] [--no-browser]');
  console.log('');
  console.log('Options:');
  console.log('  --url         output a shareable URL instead of markdown text');
  console.log('  --copy        copy output to clipboard');
  console.log('  --no-date     omit saved date from output');
  console.log('  --no-browser  omit browser info from output');
}

async function main(args) {
  if (!args.length || args[0] === '--help') {
    printUsage();
    process.exit(0);
  }

  const name = args[0];
  const asUrl = args.includes('--url');
  const doCopy = args.includes('--copy');
  const includeDate = !args.includes('--no-date');
  const includeBrowser = !args.includes('--no-browser');

  const session = await loadSession(name);
  if (!session) {
    console.error(`Session "${name}" not found.`);
    process.exit(1);
  }

  const output = asUrl
    ? formatShareUrl(session)
    : formatShareText(session, { includeDate, includeBrowser });

  if (doCopy) {
    await copyToClipboard(output);
    console.log(`Copied share ${asUrl ? 'URL' : 'text'} for: ${shareableSummary(session)}`);
  } else {
    console.log(output);
  }
}

main(process.argv.slice(2)).catch(err => {
  console.error(err.message);
  process.exit(1);
});
