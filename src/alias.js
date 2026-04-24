import { loadSession, saveSession, listSessions } from './storage.js';

const ALIAS_KEY = '__aliases__';

export async function loadAliases(dir) {
  try {
    const data = await loadSession(dir, ALIAS_KEY);
    return data.aliases || {};
  } catch {
    return {};
  }
}

export async function saveAliases(dir, aliases) {
  await saveSession(dir, ALIAS_KEY, { aliases });
}

export async function setAlias(dir, alias, sessionName) {
  const sessions = await listSessions(dir);
  if (!sessions.includes(sessionName)) {
    throw new Error(`Session "${sessionName}" not found`);
  }
  const aliases = await loadAliases(dir);
  aliases[alias] = sessionName;
  await saveAliases(dir, aliases);
  return aliases;
}

export async function removeAlias(dir, alias) {
  const aliases = await loadAliases(dir);
  if (!aliases[alias]) {
    throw new Error(`Alias "${alias}" not found`);
  }
  delete aliases[alias];
  await saveAliases(dir, aliases);
  return aliases;
}

export async function resolveAlias(dir, nameOrAlias) {
  const aliases = await loadAliases(dir);
  return aliases[nameOrAlias] || nameOrAlias;
}

export async function listAliases(dir) {
  return loadAliases(dir);
}

export function formatAliasTable(aliases) {
  const entries = Object.entries(aliases);
  if (entries.length === 0) return 'No aliases defined.';
  const rows = entries.map(([alias, target]) => `  ${alias.padEnd(20)} -> ${target}`);
  return ['Aliases:', ...rows].join('\n');
}
