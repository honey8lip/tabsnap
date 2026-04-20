// Filter sessions by various criteria

function filterByBrowser(sessions, browser) {
  return sessions.filter(s => s.browser && s.browser.toLowerCase() === browser.toLowerCase());
}

function filterByDateRange(sessions, from, to) {
  return sessions.filter(s => {
    const d = new Date(s.savedAt);
    if (from && d < new Date(from)) return false;
    if (to && d > new Date(to)) return false;
    return true;
  });
}

function filterByMinTabs(sessions, min) {
  return sessions.filter(s => Array.isArray(s.tabs) && s.tabs.length >= min);
}

function filterByMaxTabs(sessions, max) {
  return sessions.filter(s => Array.isArray(s.tabs) && s.tabs.length <= max);
}

function filterByDomain(sessions, domain) {
  return sessions.filter(s =>
    Array.isArray(s.tabs) && s.tabs.some(t => t.url && t.url.includes(domain))
  );
}

function applyFilters(sessions, opts = {}) {
  let result = [...sessions];
  if (opts.browser) result = filterByBrowser(result, opts.browser);
  if (opts.from || opts.to) result = filterByDateRange(result, opts.from, opts.to);
  if (opts.minTabs != null) result = filterByMinTabs(result, opts.minTabs);
  if (opts.maxTabs != null) result = filterByMaxTabs(result, opts.maxTabs);
  if (opts.domain) result = filterByDomain(result, opts.domain);
  return result;
}

module.exports = { filterByBrowser, filterByDateRange, filterByMinTabs, filterByMaxTabs, filterByDomain, applyFilters };
