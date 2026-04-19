// Group sessions by tag, date, or custom key

function groupByTag(sessions) {
  const groups = {};
  for (const [name, session] of Object.entries(sessions)) {
    const tags = session.tags || [];
    if (tags.length === 0) {
      (groups['untagged'] = groups['untagged'] || {})[name] = session;
    } else {
      for (const tag of tags) {
        (groups[tag] = groups[tag] || {})[name] = session;
      }
    }
  }
  return groups;
}

function groupByDate(sessions) {
  const groups = {};
  for (const [name, session] of Object.entries(sessions)) {
    const date = session.savedAt
      ? new Date(session.savedAt).toISOString().slice(0, 10)
      : 'unknown';
    (groups[date] = groups[date] || {})[name] = session;
  }
  return groups;
}

function groupByBrowser(sessions) {
  const groups = {};
  for (const [name, session] of Object.entries(sessions)) {
    const browser = session.browser || 'unknown';
    (groups[browser] = groups[browser] || {})[name] = session;
  }
  return groups;
}

function formatGroupSummary(groups) {
  const lines = [];
  for (const [key, sessions] of Object.entries(groups)) {
    const count = Object.keys(sessions).length;
    lines.push(`${key}: ${count} session${count !== 1 ? 's' : ''}`);
  }
  return lines.join('\n');
}

module.exports = { groupByTag, groupByDate, groupByBrowser, formatGroupSummary };
