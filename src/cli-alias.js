#!/usr/bin/env node
import { setAlias, removeAlias, listAliases, formatAliasTable } from './alias.js';
import { ensureDir } from './storage.js';

const SESSION_DIR = process.env.TABSNAP_DIR || `${process.env.HOME}/.tabsnap`;

export function printUsage() {
  console.log(`Usage:
  tabsnap alias set <alias> <session>   Create an alias for a session
  tabsnap alias remove <alias>          Remove an alias
  tabsnap alias list                    List all aliases`);
}

async function main() {
  await ensureDir(SESSION_DIR);
  const [,, , sub, ...args] = process.argv;

  if (!sub || sub === '--help' || sub === '-h') {
    printUsage();
    process.exit(0);
  }

  if (sub === 'set') {
    const [alias, session] = args;
    if (!alias || !session) {
      console.error('Usage: tabsnap alias set <alias> <session>');
      process.exit(1);
    }
    try {
      await setAlias(SESSION_DIR, alias, session);
      console.log(`Alias "${alias}" -> "${session}" saved.`);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
    return;
  }

  if (sub === 'remove') {
    const [alias] = args;
    if (!alias) {
      console.error('Usage: tabsnap alias remove <alias>');
      process.exit(1);
    }
    try {
      await removeAlias(SESSION_DIR, alias);
      console.log(`Alias "${alias}" removed.`);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
    return;
  }

  if (sub === 'list') {
    const aliases = await listAliases(SESSION_DIR);
    console.log(formatAliasTable(aliases));
    return;
  }

  console.error(`Unknown subcommand: ${sub}`);
  printUsage();
  process.exit(1);
}

main();
