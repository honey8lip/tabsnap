#!/usr/bin/env node
'use strict';

const { loadSession, saveSession } = require('./storage');
const { addTags, removeTags } = require('./tag');

function printUsage() {
  console.log('Usage: tabsnap tag <session> --add <tags> | --remove <tags>');
  console.log('  --add    comma-separated tags to add');
  console.log('  --remove comma-separated tags to remove');
}

async function main(argv) {
  const args = argv.slice(2);
  const sessionName = args[0];

  if (!sessionName || args.includes('--help')) {
    printUsage();
    process.exit(0);
  }

  const addIdx = args.indexOf('--add');
  const removeIdx = args.indexOf('--remove');

  if (addIdx === -1 && removeIdx === -1) {
    printUsage();
    process.exit(1);
  }

  let session;
  try {
    session = await loadSession(sessionName);
  } catch (e) {
    console.error(`Session "${sessionName}" not found.`);
    process.exit(1);
  }

  if (addIdx !== -1 && args[addIdx + 1]) {
    const tags = args[addIdx + 1].split(',');
    session = addTags(session, tags);
  }

  if (removeIdx !== -1 && args[removeIdx + 1]) {
    const tags = args[removeIdx + 1].split(',');
    session = removeTags(session, tags);
  }

  await saveSession(sessionName, session);
  console.log(`Tags updated for "${sessionName}": ${(session.tags || []).join(', ') || '(none)'}`);
}

main(process.argv).catch(err => {
  console.error(err.message);
  process.exit(1);
});
