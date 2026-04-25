// Priority levels for sessions
const LEVELS = ['low', 'normal', 'high', 'critical'];

function setPriority(session, level) {
  if (!LEVELS.includes(level)) {
    throw new Error(`Invalid priority level: ${level}. Must be one of: ${LEVELS.join(', ')}`);
  }
  return { ...session, priority: level };
}

function removePriority(session) {
  const copy = { ...session };
  delete copy.priority;
  return copy;
}

function getPriority(session) {
  return session.priority || 'normal';
}

function sortByPriority(sessions) {
  return [...sessions].sort((a, b) => {
    return LEVELS.indexOf(getPriority(b)) - LEVELS.indexOf(getPriority(a));
  });
}

function filterByPriority(sessions, level) {
  return sessions.filter(s => getPriority(s) === level);
}

function filterAbovePriority(sessions, level) {
  const threshold = LEVELS.indexOf(level);
  if (threshold === -1) throw new Error(`Invalid priority level: ${level}`);
  return sessions.filter(s => LEVELS.indexOf(getPriority(s)) >= threshold);
}

function prioritySummary(sessions) {
  const counts = Object.fromEntries(LEVELS.map(l => [l, 0]));
  for (const s of sessions) {
    const p = getPriority(s);
    counts[p] = (counts[p] || 0) + 1;
  }
  return counts;
}

module.exports = {
  LEVELS,
  setPriority,
  removePriority,
  getPriority,
  sortByPriority,
  filterByPriority,
  filterAbovePriority,
  prioritySummary
};
