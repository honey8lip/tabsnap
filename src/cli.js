#!/usr/bin/env node
// Central CLI dispatcher for tabsnap
const [,, command, ...rest] = process.argv;

const commands = {
  save: './cli-save.js',
  restore: './cli-restore.js',
  list: './cli-list.js',
  delete: './cli-delete.js',
  export: './cli-export.js',
  import: './cli-import.js',
  tag: './cli-tag.js',
  tags: './cli-list-tags.js',
  search: './cli-search.js',
  rename: './cli-rename.js',
  archive: './cli-archive.js',
};

function printHelp() {
  console.log('tabsnap — save and restore browser tab sessions\n');
  console.log('Usage: tabsnap <command> [options]\n');
  console.log('Commands:');
  Object.keys(commands).forEach(cmd => console.log(`  ${cmd}`));
}

if (!command || command === '--help' || command === '-h') {
  printHelp();
  process.exit(0);
}

if (!commands[command]) {
  console.error(`Unknown command: ${command}`);
  printHelp();
  process.exit(1);
}

process.argv = [process.argv[0], commands[command], command, ...rest];
await import(commands[command]);
