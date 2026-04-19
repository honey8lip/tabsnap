const { loadSession, saveSession } = require('./storage');

function markFavorite(session) {
  return { ...session, favorite: true };
}

function unmarkFavorite(session) {
  const s = { ...session };
  delete s.favorite;
  return s;
}

function isFavorite(session) {
  return session.favorite === true;
}

function filterFavorites(sessions) {
  return sessions.filter(isFavorite);
}

function filterNonFavorites(sessions) {
  return sessions.filter(s => !isFavorite(s));
}

function listFavorites(sessions) {
  return filterFavorites(sessions).map(s => s.name);
}

module.exports = {
  markFavorite,
  unmarkFavorite,
  isFavorite,
  filterFavorites,
  filterNonFavorites,
  listFavorites,
};
