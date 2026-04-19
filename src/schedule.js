import { saveSession } from './storage.js';
import { detectBrowser, parseTabs, formatSession } from './browser.js';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const SCHEDULE_FILE = path.join(process.env.HOME || '.', '.tabsnap', 'schedule.json');

export function loadSchedule() {
  if (!fs.existsSync(SCHEDULE_FILE)) return {};
  return JSON.parse(fs.readFileSync(SCHEDULE_FILE, 'utf8'));
}

export function saveSchedule(schedule) {
  fs.mkdirSync(path.dirname(SCHEDULE_FILE), { recursive: true });
  fs.writeFileSync(SCHEDULE_FILE, JSON.stringify(schedule, null, 2));
}

export function setSchedule(name, intervalMinutes) {
  const schedule = loadSchedule();
  schedule[name] = {
    name,
    intervalMinutes,
    lastRun: null,
    createdAt: new Date().toISOString()
  };
  saveSchedule(schedule);
  return schedule[name];
}

export function removeSchedule(name) {
  const schedule = loadSchedule();
  if (!schedule[name]) throw new Error(`No schedule found for: ${name}`);
  delete schedule[name];
  saveSchedule(schedule);
}

export function isDue(entry) {
  if (!entry.lastRun) return true;
  const elapsed = (Date.now() - new Date(entry.lastRun).getTime()) / 1000 / 60;
  return elapsed >= entry.intervalMinutes;
}

export async function runDue(sessionsDir) {
  const schedule = loadSchedule();
  const results = [];
  for (const [name, entry] of Object.entries(schedule)) {
    if (!isDue(entry)) continue;
    try {
      const browser = detectBrowser();
      const raw = execSync(browser.listTabsCmd, { encoding: 'utf8' });
      const tabs = parseTabs(raw, browser.name);
      const session = formatSession(name, tabs);
      await saveSession(sessionsDir, name, session);
      entry.lastRun = new Date().toISOString();
      results.push({ name, success: true, tabCount: tabs.length });
    } catch (err) {
      results.push({ name, success: false, error: err.message });
    }
  }
  saveSchedule(schedule);
  return results;
}
