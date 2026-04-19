#!/usr/bin/env node
import { readLock, isLocked, releaseLock } from './lock.js';

const [,, command] = process.argv;

function printUsage() {
  console.log('Usage: tabsnap lock <status|release>');
  console.log('');
  console.log('Commands:');
  console.log('  status   Show current lock info');
  console.log('  release  Force release the lock (use with caution)');
}

if (!command || command === '--help' || command === '-h') {
  printUsage();
  process.exit(0);
}

if (command === 'status') {
  if (!isLocked()) {
    console.log('No lock held.');
  } else {
    const info = readLock();
    const age = Math.round((Date.now() - info.ts) / 1000);
    console.log(`Lock held by PID ${info.pid} (${age}s ago)`);
  }
} else if (command === 'release') {
  if (!isLocked()) {
    console.log('No active lock to release.');
  } else {
    const info = readLock();
    releaseLock();
    console.log(`Released lock held by PID ${info.pid}.`);
  }
} else {
  console.error(`Unknown command: ${command}`);
  printUsage();
  process.exit(1);
}
