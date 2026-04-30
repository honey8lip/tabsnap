#!/usr/bin/env node
// cli-annotate.js — CLI for managing session annotations

import { loadSession, saveSession } from './storage.js';
import {
  setAnnotation, removeAnnotation, listAnnotations,
  clearAnnotations, formatAnnotations
} from './annotate.js';

export function printUsage() {
  console.log(`Usage: tabsnap annotate <command> <session> [key] [value]

Commands:
  set <session> <key> <value>   Set an annotation on a session
  get <session> <key>           Get a single annotation value
  remove <session> <key>        Remove an annotation
  list <session>                List all annotations
  clear <session>               Remove all annotations
`);
}

export async function main(args = process.argv.slice(2)) {
  const [cmd, sessionName, key, ...rest] = args;
  const value = rest.join(' ');

  if (!cmd || !sessionName) {
    printUsage();
    process.exit(1);
  }

  let session;
  try {
    session = await loadSession(sessionName);
  } catch {
    console.error(`Session not found: ${sessionName}`);
    process.exit(1);
  }

  switch (cmd) {
    case 'set': {
      if (!key || value === '') {
        console.error('set requires <key> and <value>');
        process.exit(1);
      }
      const updated = setAnnotation(session, key, value);
      await saveSession(sessionName, updated);
      console.log(`Annotation "${key}" set on "${sessionName}".`);
      break;
    }
    case 'get': {
      if (!key) { console.error('get requires <key>'); process.exit(1); }
      const val = session.annotations?.[key];
      if (val === undefined) { console.log(`(not set)`); }
      else { console.log(val); }
      break;
    }
    case 'remove': {
      if (!key) { console.error('remove requires <key>'); process.exit(1); }
      const updated = removeAnnotation(session, key);
      await saveSession(sessionName, updated);
      console.log(`Annotation "${key}" removed from "${sessionName}".`);
      break;
    }
    case 'list': {
      const entries = listAnnotations(session);
      if (entries.length === 0) { console.log('No annotations.'); }
      else { console.log(formatAnnotations(session)); }
      break;
    }
    case 'clear': {
      const updated = clearAnnotations(session);
      await saveSession(sessionName, updated);
      console.log(`All annotations cleared from "${sessionName}".`);
      break;
    }
    default:
      console.error(`Unknown command: ${cmd}`);
      printUsage();
      process.exit(1);
  }
}

if (process.argv[1]?.endsWith('cli-annotate.js')) {
  main();
}
