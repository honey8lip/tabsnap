#!/usr/bin/env node
import { loadSession, saveSession, listSessions } from './storage.js';
import { packSession, unpackSession, isCompressed, compressSummary } from './compress.js';

export function printUsage() {
  console.log('Usage: tabsnap compress <pack|unpack|status> [name]');
  console.log('  pack <name>      Compress a saved session');
  console.log('  unpack <name>    Decompress a packed session');
  console.log('  status           Show compression status of all sessions');
}

const [,, , subcommand, name] = process.argv;

async function main() {
  if (!subcommand || subcommand === '--help') {
    printUsage();
    process.exit(0);
  }

  if (subcommand === 'status') {
    const sessions = await listSessions();
    if (sessions.length === 0) {
      console.log('No sessions found.');
      return;
    }
    for (const n of sessions) {
      const s = await loadSession(n);
      const flag = isCompressed(s) ? '🗜  compressed' : '📄 plain';
      console.log(`  ${n}: ${flag}`);
    }
    return;
  }

  if (!name) {
    console.error('Error: session name required');
    printUsage();
    process.exit(1);
  }

  const session = await loadSession(name);
  if (!session) {
    console.error(`Session "${name}" not found.`);
    process.exit(1);
  }

  if (subcommand === 'pack') {
    if (isCompressed(session)) {
      console.log(`Session "${name}" is already compressed.`);
      return;
    }
    const packed = packSession(session);
    await saveSession(name, packed);
    const { ratio, originalBytes, compressedBytes } = packed.meta;
    console.log(`Packed "${name}": ${originalBytes}B → ${compressedBytes}B (${ratio}% saved)`);
  } else if (subcommand === 'unpack') {
    if (!isCompressed(session)) {
      console.log(`Session "${name}" is not compressed.`);
      return;
    }
    const unpacked = unpackSession(session);
    await saveSession(name, unpacked);
    console.log(`Unpacked "${name}" successfully.`);
  } else {
    console.error(`Unknown subcommand: ${subcommand}`);
    printUsage();
    process.exit(1);
  }
}

main();
