import { loadSession, saveSession, deleteSession, listSessions } from './storage.js';

export async function archiveSession(name, sessionsDir, archiveDir) {
  const session = await loadSession(name, sessionsDir);
  const archivedName = `${name}_archived_${Date.now()}`;
  await saveSession(archivedName, session, archiveDir);
  await deleteSession(name, sessionsDir);
  return archivedName;
}

export async function unarchiveSession(name, archiveDir, sessionsDir) {
  const session = await loadSession(name, archiveDir);
  const restoredName = name.replace(/_archived_\d+$/, '');
  await saveSession(restoredName, session, sessionsDir);
  await deleteSession(name, archiveDir);
  return restoredName;
}

export async function listArchived(archiveDir) {
  return listSessions(archiveDir);
}

export async function purgeArchive(archiveDir) {
  const sessions = await listSessions(archiveDir);
  for (const name of sessions) {
    await deleteSession(name, archiveDir);
  }
  return sessions.length;
}
