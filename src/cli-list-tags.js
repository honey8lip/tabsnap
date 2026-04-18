#!/usr/bin/env node
'use strict';

const { listSessions, loadSession } = require('./storage');
const { filterByTag, listAllTags } = require('./tag');

async function main(argv) {
  const args = argv.slice(2);
  const filterTag = args[0];

  const names = await listSessions();
  if (names.length === 0) {
    console.log('No sessions saved.');
    return;
  }

  const sessions = await Promise.all(
    names.map(async name => {
      try { return await loadSession(name); } catch { return null; }
    })
  ).then(all => all.filter(Boolean));

  if (!filterTag) {
    const tags = listAllTags(sessions);
    if (tags.length === 0) {
      console.log('No tags found.');
    } else {
      console.log('All tags:');
      tags.forEach(t => console.log(`  ${t}`));
    }
    return;
  }

  const matched = filterByTag(sessions, filterTag);
  if (matched.length === 0) {
    console.log(`No sessions tagged "${filterTag}".`);
  } else {
    console.log(`Sessions tagged "${filterTag}":`);
    matched.forEach(s => console.log(`  ${s.name}`));
  }
}

main(process.argv).catch(err => {
  console.error(err.message);
  process.exit(1);
});
