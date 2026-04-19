const { loadSession, saveSession } = require('./storage');

async function addNote(name, note, sessionsDir) {
  const session = await loadSession(name, sessionsDir);
  if (!session) throw new Error(`Session '${name}' not found`);
  session.notes = session.notes || [];
  session.notes.push({ text: note, createdAt: new Date().toISOString() });
  await saveSession(name, session, sessionsDir);
  return session;
}

async function removeNote(name, index, sessionsDir) {
  const session = await loadSession(name, sessionsDir);
  if (!session) throw new Error(`Session '${name}' not found`);
  session.notes = session.notes || [];
  if (index < 0 || index >= session.notes.length) {
    throw new Error(`Note index ${index} out of range`);
  }
  const removed = session.notes.splice(index, 1)[0];
  await saveSession(name, session, sessionsDir);
  return removed;
}

async function getNotes(name, sessionsDir) {
  const session = await loadSession(name, sessionsDir);
  if (!session) throw new Error(`Session '${name}' not found`);
  return session.notes || [];
}

function formatNotes(notes) {
  if (!notes || notes.length === 0) return '  (no notes)';
  return notes.map((n, i) => `  [${i}] ${n.text}  (${n.createdAt})`).join('\n');
}

module.exports = { addNote, removeNote, getNotes, formatNotes };
