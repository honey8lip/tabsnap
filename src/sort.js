// Sort sessions by various criteria

function sortByDate(sessions, order = 'desc') {
  return [...sessions].sort((a, b) => {
    const ta = new Date(a.savedAt || 0).getTime();
    const tb = new Date(b.savedAt || 0).getTime();
    return order === 'asc' ? ta - tb : tb - ta;
  });
}

function sortByName(sessions, order = 'asc') {
  return [...sessions].sort((a, b) => {
    const na = (a.name || '').toLowerCase();
    const nb = (b.name || '').toLowerCase();
    const cmp = na.localeCompare(nb);
    return order === 'asc' ? cmp : -cmp;
  });
}

function sortByTabCount(sessions, order = 'desc') {
  return [...sessions].sort((a, b) => {
    const ca = (a.tabs || []).length;
    const cb = (b.tabs || []).length;
    return order === 'asc' ? ca - cb : cb - ca;
  });
}

function sortByBrowser(sessions, order = 'asc') {
  return [...sessions].sort((a, b) => {
    const ba = (a.browser || '').toLowerCase();
    const bb = (b.browser || '').toLowerCase();
    const cmp = ba.localeCompare(bb);
    return order === 'asc' ? cmp : -cmp;
  });
}

const SORT_KEYS = ['date', 'name', 'tabs', 'browser'];

function sortSessions(sessions, key = 'date', order = 'desc') {
  switch (key) {
    case 'name':    return sortByName(sessions, order);
    case 'tabs':    return sortByTabCount(sessions, order);
    case 'browser': return sortByBrowser(sessions, order);
    case 'date':    
    default:        return sortByDate(sessions, order);
  }
}

module.exports = { sortSessions, sortByDate, sortByName, sortByTabCount, sortByBrowser, SORT_KEYS };
