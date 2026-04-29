// Utility helpers for rating display and analysis

export function ratingLabel(rating) {
  const labels = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Great', 5: 'Excellent' };
  return labels[rating] ?? 'Unrated';
}

export function averageRating(sessions) {
  const rated = sessions.filter(s => typeof s.rating === 'number');
  if (rated.length === 0) return null;
  return rated.reduce((sum, s) => sum + s.rating, 0) / rated.length;
}

export function topRated(sessions, n = 5) {
  return [...sessions]
    .filter(s => typeof s.rating === 'number')
    .sort((a, b) => b.rating - a.rating)
    .slice(0, n);
}

export function groupByRating(sessions) {
  const groups = { 1: [], 2: [], 3: [], 4: [], 5: [], unrated: [] };
  for (const s of sessions) {
    if (typeof s.rating === 'number' && s.rating >= 1 && s.rating <= 5) {
      groups[s.rating].push(s);
    } else {
      groups.unrated.push(s);
    }
  }
  return groups;
}

export function formatRatingLine(session) {
  const stars = typeof session.rating === 'number'
    ? '★'.repeat(session.rating) + '☆'.repeat(5 - session.rating)
    : '(unrated)';
  const label = ratingLabel(session.rating);
  return `${stars}  [${label}]  ${session.name || 'unnamed'}`;
}

export function ratingPercentile(sessions, rating) {
  const rated = sessions.filter(s => typeof s.rating === 'number');
  if (rated.length === 0) return null;
  const below = rated.filter(s => s.rating < rating).length;
  return Math.round((below / rated.length) * 100);
}
