#!/usr/bin/env node
import { listSessions, loadSession, saveSession } from './storage.js';
import {
  listProfiles,
  assignProfile,
  removeProfile,
  profileSummary,
  formatProfileReport,
} from './profile.js';

export function printUsage() {
  console.log(`Usage: tabsnap profile <subcommand> [args]

Subcommands:
  list                     List all profiles
  show <profile>           Show sessions in a profile
  set <session> <profile>  Assign session to a profile
  unset <session>          Remove profile from session
`);
}

const [,, , sub, ...args] = process.argv;

async function main() {
  const sessions = await listSessions();
  const loaded = await Promise.all(sessions.map(n => loadSession(n)));

  if (!sub || sub === '--help') {
    printUsage();
    return;
  }

  if (sub === 'list') {
    const profiles = listProfiles(loaded);
    if (!profiles.length) {
      console.log('No profiles defined.');
    } else {
      profiles.forEach(p => console.log(p));
    }
    return;
  }

  if (sub === 'show') {
    const [profileName] = args;
    if (!profileName) { printUsage(); process.exit(1); }
    const summary = profileSummary(loaded, profileName);
    console.log(formatProfileReport(summary));
    return;
  }

  if (sub === 'set') {
    const [sessionName, profileName] = args;
    if (!sessionName || !profileName) { printUsage(); process.exit(1); }
    const session = await loadSession(sessionName);
    const updated = assignProfile(session, profileName);
    await saveSession(sessionName, updated);
    console.log(`Assigned '${sessionName}' to profile '${profileName}'.`);
    return;
  }

  if (sub === 'unset') {
    const [sessionName] = args;
    if (!sessionName) { printUsage(); process.exit(1); }
    const session = await loadSession(sessionName);
    const updated = removeProfile(session);
    await saveSession(sessionName, updated);
    console.log(`Removed profile from '${sessionName}'.`);
    return;
  }

  console.error(`Unknown subcommand: ${sub}`);
  printUsage();
  process.exit(1);
}

main().catch(e => { console.error(e.message); process.exit(1); });
