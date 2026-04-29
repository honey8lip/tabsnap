#!/usr/bin/env node
import { loadSession, saveSession, listSessions } from './storage.js';
import { setRating, removeRating, getRating, formatStars, ratingSummary, sortByRating } from './rating.js';

export function printUsage() {
  console.log(`Usage: tabsnap rating <subcommand> [options]

Subcommands:
  set <name> <1-5>   Set star rating for a session
  remove <name>      Remove rating from a session
  show <name>        Show rating for a session
  list [--min N]     List sessions with ratings
  summary            Show rating statistics
  top [N]            Show top-rated sessions (default: 5)
`);
}

async function main() {
  const [sub, ...args] = process.argv.slice(2);

  if (!sub || sub === '--help' || sub === '-h') return printUsage();

  if (sub === 'set') {
    const [name, rawRating] = args;
    if (!name || !rawRating) return printUsage();
    const session = await loadSession(name);
    const updated = setRating(session, parseInt(rawRating, 10));
    await saveSession(name, updated);
    console.log(`Rated "${name}": ${formatStars(updated.rating)}`);

  } else if (sub === 'remove') {
    const [name] = args;
    if (!name) return printUsage();
    const session = await loadSession(name);
    await saveSession(name, removeRating(session));
    console.log(`Removed rating from "${name}"`);

  } else if (sub === 'show') {
    const [name] = args;
    if (!name) return printUsage();
    const session = await loadSession(name);
    const r = getRating(session);
    console.log(`${name}: ${formatStars(r)}`);

  } else if (sub === 'list') {
    const minIdx = args.indexOf('--min');
    const min = minIdx !== -1 ? parseInt(args[minIdx + 1], 10) : 1;
    const names = await listSessions();
    const sessions = await Promise.all(names.map(n => loadSession(n).then(s => ({ ...s, _name: n }))));
    const filtered = sessions.filter(s => typeof s.rating === 'number' && s.rating >= min);
    const sorted = sortByRating(filtered);
    if (sorted.length === 0) { console.log('No rated sessions found.'); return; }
    for (const s of sorted) console.log(`${formatStars(s.rating)}  ${s._name}`);

  } else if (sub === 'summary') {
    const names = await listSessions();
    const sessions = await Promise.all(names.map(n => loadSession(n)));
    const { count, average, distribution } = ratingSummary(sessions);
    if (count === 0) { console.log('No rated sessions.'); return; }
    console.log(`Rated sessions: ${count}`);
    console.log(`Average rating: ${formatStars(Math.round(average))} (${average})`);
    for (let i = 5; i >= 1; i--) console.log(`  ${formatStars(i)}: ${distribution[i]}`);

  } else if (sub === 'top') {
    const n = parseInt(args[0], 10) || 5;
    const names = await listSessions();
    const sessions = await Promise.all(names.map(nm => loadSession(nm).then(s => ({ ...s, _name: nm }))));
    const top = sortByRating(sessions.filter(s => typeof s.rating === 'number')).slice(0, n);
    if (top.length === 0) { console.log('No rated sessions.'); return; }
    top.forEach((s, i) => console.log(`${i + 1}. ${formatStars(s.rating)}  ${s._name}`));

  } else {
    console.error(`Unknown subcommand: ${sub}`);
    printUsage();
    process.exit(1);
  }
}

main().catch(e => { console.error(e.message); process.exit(1); });
