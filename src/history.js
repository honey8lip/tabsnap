/**
 * history.js — track command history and session access patterns
 * Records when sessions are saved, restored, exported, etc.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const HISTORY_FILE = path.join(os.homedir(), '.tabsnap', 'history.json');
const MAX_HISTORY = 500;

/**
 * Load the full history log
 * @returns {Array}
 */
function loadHistory(historyFile = HISTORY_FILE) {
  try {
    const raw = fs.readFileSync(historyFile, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Append a history entry
 * @param {string} action - e.g. 'save', 'restore', 'delete', 'export'
 * @param {string} sessionName
 * @param {Object} meta - optional extra info
 * @param {string} historyFile
 */
function recordAction(action, sessionName, meta = {}, historyFile = HISTORY_FILE) {
  const history = loadHistory(historyFile);
  const entry = {
    action,
    session: sessionName,
    timestamp: new Date().toISOString(),
    ...meta,
  };
  history.push(entry);

  // Trim to max size
  const trimmed = history.slice(-MAX_HISTORY);

  const dir = path.dirname(historyFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(historyFile, JSON.stringify(trimmed, null, 2));
  return entry;
}

/**
 * Get history entries for a specific session
 * @param {string} sessionName
 * @param {string} historyFile
 * @returns {Array}
 */
function sessionHistory(sessionName, historyFile = HISTORY_FILE) {
  const history = loadHistory(historyFile);
  return history.filter(e => e.session === sessionName);
}

/**
 * Get the N most recent history entries
 * @param {number} n
 * @param {string} historyFile
 * @returns {Array}
 */
function recentHistory(n = 20, historyFile = HISTORY_FILE) {
  const history = loadHistory(historyFile);
  return history.slice(-n).reverse();
}

/**
 * Filter history by action type
 * @param {string} action
 * @param {string} historyFile
 * @returns {Array}
 */
function filterByAction(action, historyFile = HISTORY_FILE) {
  const history = loadHistory(historyFile);
  return history.filter(e => e.action === action);
}

/**
 * Summarize history — count of each action type
 * @param {string} historyFile
 * @returns {Object}
 */
function summarizeHistory(historyFile = HISTORY_FILE) {
  const history = loadHistory(historyFile);
  const counts = {};
  for (const entry of history) {
    counts[entry.action] = (counts[entry.action] || 0) + 1;
  }
  return {
    total: history.length,
    counts,
    oldest: history[0]?.timestamp || null,
    newest: history[history.length - 1]?.timestamp || null,
  };
}

/**
 * Clear all history
 * @param {string} historyFile
 */
function clearHistory(historyFile = HISTORY_FILE) {
  const dir = path.dirname(historyFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(historyFile, JSON.stringify([]));
}

/**
 * Format a history entry for display
 * @param {Object} entry
 * @returns {string}
 */
function formatEntry(entry) {
  const ts = new Date(entry.timestamp).toLocaleString();
  return `[${ts}] ${entry.action.padEnd(10)} ${entry.session}`;
}

module.exports = {
  loadHistory,
  recordAction,
  sessionHistory,
  recentHistory,
  filterByAction,
  summarizeHistory,
  clearHistory,
  formatEntry,
  HISTORY_FILE,
  MAX_HISTORY,
};
