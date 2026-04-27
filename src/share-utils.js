function truncateUrl(url, maxLen = 60) {
  if (!url) return '';
  return url.length > maxLen ? url.slice(0, maxLen - 3) + '...' : url;
}

function buildQrPayload(session) {
  const tabs = (session.tabs || []).map(t => t.url).filter(Boolean);
  return JSON.stringify({ name: session.name, urls: tabs });
}

function estimateShareSize(session) {
  const payload = buildQrPayload(session);
  return Buffer.byteLength(payload, 'utf8');
}

function sanitizeForShare(session) {
  return {
    name: session.name,
    tabs: (session.tabs || []).map(({ title, url }) => ({ title, url })),
  };
}

function formatShareHeader(session) {
  const count = (session.tabs || []).length;
  const browser = session.browser ? ` [${session.browser}]` : '';
  return `${session.name}${browser} (${count} tab${count !== 1 ? 's' : ''})`;
}

module.exports = { truncateUrl, buildQrPayload, estimateShareSize, sanitizeForShare, formatShareHeader };
