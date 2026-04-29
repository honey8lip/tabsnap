// Session rating: 1-5 stars, stored in session metadata

export function setRating(session, rating) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error(`Rating must be an integer between 1 and 5, got: ${rating}`);
  }
  return { ...session, rating };
}

export function removeRating(session) {
  const { rating, ...rest } = session;
  return rest;
}

export function getRating(session) {
  return session.rating ?? null;
}

export function hasRating(session) {
  return typeof session.rating === 'number';
}

export function filterByMinRating(sessions, min) {
  return sessions.filter(s => typeof s.rating === 'number' && s.rating >= min);
}

export function filterRated(sessions) {
  return sessions.filter(s => hasRating(s));
}

export function filterUnrated(sessions) {
  return sessions.filter(s => !hasRating(s));
}

export function sortByRating(sessions, order = 'desc') {
  return [...sessions].sort((a, b) => {
    const ra = a.rating ?? 0;
    const rb = b.rating ?? 0;
    return order === 'asc' ? ra - rb : rb - ra;
  });
}

export function formatStars(rating) {
  if (rating === null || rating === undefined) return '(unrated)';
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

export function ratingSummary(sessions) {
  const rated = filterRated(sessions);
  if (rated.length === 0) return { count: 0, average: null, distribution: {} };
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let total = 0;
  for (const s of rated) {
    distribution[s.rating]++;
    total += s.rating;
  }
  return {
    count: rated.length,
    average: parseFloat((total / rated.length).toFixed(2)),
    distribution
  };
}
