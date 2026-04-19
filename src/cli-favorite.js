#!/usr/bin/env node
const { loadSession, saveSession, listSessions } = require('./storage');
const { markFavorite, unmarkFavorite, listFavorites, filterFavorites } = require('./favorite');

function printUsage() {
  console.log('Usage: tabsnap favorite <add|remove|list> [name]');
}

async function main() {
  const [,, cmd, name] = process.argv;

  if (!cmd || cmd === '--help') {
    printUsage();
    process.exit(0);
  }

  if (cmd === 'list') {
    const names = await listSessions();
    const sessions = await Promise.all(names.map(n => loadSession(n)));
    const favs = listFavorites(sessions);
    if (favs.length === 0) {
      console.log('No favorite sessions.');
    } else {
      favs.forEach(n => console.log(' *', n));
    }
    return;
  }

  if (!name) {
    console.error('Error: session name required');
    printUsage();
    process.exit(1);
  }

  let session;
  try {
    session = await loadSession(name);
  } catch {
    console.error(`Session not found: ${name}`);
    process.exit(1);
  }

  if (cmd === 'add') {
    await saveSession(name, markFavorite(session));
    console.log(`Marked "${name}" as favorite.`);
  } else if (cmd === 'remove') {
    await saveSession(name, unmarkFavorite(session));
    console.log(`Removed "${name}" from favorites.`);
  } else {
    console.error(`Unknown command: ${cmd}`);
    printUsage();
    process.exit(1);
  }
}

main();
