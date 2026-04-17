#!/usr/bin/env node
'use strict';

const { deleteSession, listSessions } = require('./storage');
const readline = require('readline');

function confirm(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  const name = args[0];
  const force = args.includes('--force') || args.includes('-f');

  if (!name) {
    console.error('Usage: tabsnap delete <session-name> [--force]');
    process.exit(1);
  }

  const sessions = await listSessions();
  if (!sessions.includes(name)) {
    console.error(`Session "${name}" not found.`);
    process.exit(1);
  }

  if (!force) {
    const answer = await confirm(`Delete session "${name}"? [y/N] `);
    if (answer !== 'y' && answer !== 'yes') {
      console.log('Aborted.');
      return;
    }
  }

  try {
    await deleteSession(name);
    console.log(`Deleted session "${name}".`);
  } catch (err) {
    console.error('Failed to delete session:', err.message);
    process.exit(1);
  }
}

main();
