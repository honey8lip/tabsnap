#!/usr/bin/env node
'use strict';

const { loadSession, saveSession, listSessions } = require('./storage');
const { setPriority, removePriority, getPriority, filterByPriority, sortByPriority, LEVELS } = require('./priority');
const { colorize, bold } = require('./color');

function printUsage() {
  console.log(`Usage: tabsnap priority <subcommand> [options]

Subcommands:
  set <name> <level>   Set priority level for a session (${LEVELS.join('|')})
  clear <name>         Remove priority from a session
  list [level]         List sessions sorted by priority, optionally filter by level

Examples:
  tabsnap priority set work high
  tabsnap priority clear work
  tabsnap priority list
  tabsnap priority list critical`);
}

async function main(args) {
  const [sub, ...rest] = args;

  if (!sub || sub === '--help' || sub === '-h') {
    printUsage();
    return;
  }

  if (sub === 'set') {
    const [name, level] = rest;
    if (!name || !level) { printUsage(); process.exit(1); }
    const session = await loadSession(name);
    if (!session) { console.error(`Session not found: ${name}`); process.exit(1); }
    const updated = setPriority(session, level);
    await saveSession(name, updated);
    console.log(`Set priority of ${bold(name)} to ${colorize(level, level === 'critical' ? 'red' : level === 'high' ? 'yellow' : 'cyan')}`);
    return;
  }

  if (sub === 'clear') {
    const [name] = rest;
    if (!name) { printUsage(); process.exit(1); }
    const session = await loadSession(name);
    if (!session) { console.error(`Session not found: ${name}`); process.exit(1); }
    await saveSession(name, removePriority(session));
    console.log(`Cleared priority for ${bold(name)}`);
    return;
  }

  if (sub === 'list') {
    const [levelFilter] = rest;
    const names = await listSessions();
    let sessions = await Promise.all(names.map(async n => ({ ...(await loadSession(n)), _name: n })));
    if (levelFilter) sessions = filterByPriority(sessions, levelFilter);
    else sessions = sortByPriority(sessions);
    if (sessions.length === 0) { console.log('No sessions found.'); return; }
    for (const s of sessions) {
      const p = getPriority(s);
      console.log(`${bold(s._name)} [${p}] — ${(s.tabs || []).length} tabs`);
    }
    return;
  }

  console.error(`Unknown subcommand: ${sub}`);
  printUsage();
  process.exit(1);
}

main(process.argv.slice(2)).catch(err => { console.error(err.message); process.exit(1); });

module.exports = { printUsage };
