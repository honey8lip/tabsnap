#!/usr/bin/env node
// cli-rename.js - CLI handler for renaming sessions

const path = require('path');
const { renameSession } = require('./rename');

const DEFAULT_DIR = path.join(process.env.HOME || process.env.USERPROFILE || '.', '.tabsnap');

function printUsage() {
  console.log('Usage: tabsnap rename <old-name> <new-name>');
  console.log('');
  console.log('Rename a saved session.');
  console.log('');
  console.log('Arguments:');
  console.log('  old-name   Current session name');
  console.log('  new-name   New session name');
}

async function main(argv = process.argv.slice(2)) {
  const dir = process.env.TABSNAP_DIR || DEFAULT_DIR;

  if (argv.includes('--help') || argv.includes('-h')) {
    printUsage();
    process.exit(0);
  }

  const [oldName, newName] = argv;

  if (!oldName || !newName) {
    printUsage();
    process.exit(1);
  }

  try {
    await renameSession(dir, oldName, newName);
    console.log(`Renamed "${oldName}" → "${newName}"`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

main();

module.exports = { main, printUsage };
