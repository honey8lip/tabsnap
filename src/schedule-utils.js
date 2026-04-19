/**
 * Utility helpers for schedule display and validation.
 */

export function formatInterval(minutes) {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function parseInterval(str) {
  if (!str) throw new Error('Interval required');
  const asNum = parseInt(str, 10);
  if (!isNaN(asNum) && String(asNum) === str) return asNum;
  const match = str.match(/^(\d+)h(?:\s*(\d+)m)?$/);
  if (match) return parseInt(match[1]) * 60 + (match[2] ? parseInt(match[2]) : 0);
  const mOnly = str.match(/^(\d+)m$/);
  if (mOnly) return parseInt(mOnly[1]);
  throw new Error(`Cannot parse interval: ${str}`);
}

export function nextRunEstimate(entry) {
  if (!entry.lastRun) return 'now';
  const next = new Date(entry.lastRun).getTime() + entry.intervalMinutes * 60 * 1000;
  const diff = next - Date.now();
  if (diff <= 0) return 'now';
  const mins = Math.ceil(diff / 1000 / 60);
  return `in ${formatInterval(mins)}`;
}

export function validateName(name) {
  if (!name || typeof name !== 'string') throw new Error('Name must be a non-empty string');
  if (!/^[\w-]+$/.test(name)) throw new Error('Name must be alphanumeric with dashes/underscores only');
  return true;
}
