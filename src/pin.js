// pin.js — mark sessions as pinned (protected from deletion/archiving)

function pinSession(session) {
  return { ...session, pinned: true };
}

function unpinSession(session) {
  const s = { ...session };
  delete s.pinned;
  return s;
}

function isPinned(session) {
  return session.pinned === true;
}

function filterPinned(sessions) {
  return sessions.filter(isPinned);
}

function filterUnpinned(sessions) {
  return sessions.filter(s => !isPinned(s));
}

function listPinned(sessions) {
  return filterPinned(sessions).map(s => s.name);
}

module.exports = {
  pinSession,
  unpinSession,
  isPinned,
  filterPinned,
  filterUnpinned,
  listPinned,
};
