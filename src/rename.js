// rename.js - rename saved sessions

const { loadSession, saveSession, deleteSession, listSessions } = require('./storage');

/**
 * Rename a session from oldName to newName.
 * Throws if oldName doesn't exist or newName already exists.
 */
async function renameSession(dir, oldName, newName) {
  if (!oldName || !newName) throw new Error('Both old and new names are required');
  if (oldName === newName) throw new Error('New name must differ from old name');

  const sessions = await listSessions(dir);
  if (!sessions.includes(oldName)) {
    throw new Error(`Session "${oldName}" not found`);
  }
  if (sessions.includes(newName)) {
    throw new Error(`Session "${newName}" already exists`);
  }

  const session = await loadSession(dir, oldName);
  session.name = newName;
  session.renamedAt = new Date().toISOString();

  await saveSession(dir, newName, session);
  await deleteSession(dir, oldName);

  return session;
}

module.exports = { renameSession };
