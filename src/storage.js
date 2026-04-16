const fs = require('fs');
const path = require('path');

const DEFAULT_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.tabsnap');

function ensureDir(dir = DEFAULT_DIR) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function saveSession(name, tabs, dir = DEFAULT_DIR) {
  ensureDir(dir);
  const filePath = path.join(dir, `${name}.json`);
  const session = {
    name,
    savedAt: new Date().toISOString(),
    tabs,
  };
  fs.writeFileSync(filePath, JSON.stringify(session, null, 2));
  return filePath;
}

function loadSession(name, dir = DEFAULT_DIR) {
  const filePath = path.join(dir, `${name}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Session "${name}" not found.`);
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

function listSessions(dir = DEFAULT_DIR) {
  ensureDir(dir);
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''));
}

function deleteSession(name, dir = DEFAULT_DIR) {
  const filePath = path.join(dir, `${name}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Session "${name}" not found.`);
  }
  fs.unlinkSync(filePath);
}

module.exports = { saveSession, loadSession, listSessions, deleteSession };
