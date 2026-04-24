import fs from 'fs';
import path from 'path';
import { listSessions, loadSession } from './storage.js';

export const DEFAULT_QUOTA = {
  maxSessions: 100,
  maxTabsPerSession: 500,
  maxTotalTabs: 5000,
  maxStorageMb: 50
};

export function getStorageSize(dir) {
  if (!fs.existsSync(dir)) return 0;
  let total = 0;
  for (const file of fs.readdirSync(dir)) {
    try {
      const stat = fs.statSync(path.join(dir, file));
      if (stat.isFile()) total += stat.size;
    } catch {}
  }
  return total;
}

export function checkQuota(sessions, tabs, storageMb, quota = DEFAULT_QUOTA) {
  const violations = [];
  if (sessions > quota.maxSessions)
    violations.push(`session count (${sessions}) exceeds limit of ${quota.maxSessions}`);
  if (tabs > quota.maxTotalTabs)
    violations.push(`total tab count (${tabs}) exceeds limit of ${quota.maxTotalTabs}`);
  if (storageMb > quota.maxStorageMb)
    violations.push(`storage (${storageMb.toFixed(1)} MB) exceeds limit of ${quota.maxStorageMb} MB`);
  return violations;
}

export async function quotaReport(dir, quota = DEFAULT_QUOTA) {
  const names = await listSessions(dir);
  let totalTabs = 0;
  const perSession = [];
  for (const name of names) {
    const session = await loadSession(dir, name);
    const count = session.tabs ? session.tabs.length : 0;
    totalTabs += count;
    const tooManyTabs = count > quota.maxTabsPerSession;
    perSession.push({ name, count, tooManyTabs });
  }
  const storageMb = getStorageSize(dir) / (1024 * 1024);
  const violations = checkQuota(names.length, totalTabs, storageMb, quota);
  return {
    sessionCount: names.length,
    totalTabs,
    storageMb,
    violations,
    perSession,
    ok: violations.length === 0
  };
}

export function formatQuotaReport(report, quota = DEFAULT_QUOTA) {
  const lines = [
    `Sessions : ${report.sessionCount} / ${quota.maxSessions}`,
    `Total tabs: ${report.totalTabs} / ${quota.maxTotalTabs}`,
    `Storage  : ${report.storageMb.toFixed(2)} MB / ${quota.maxStorageMb} MB`
  ];
  if (report.violations.length) {
    lines.push('\nViolations:');
    for (const v of report.violations) lines.push(`  ⚠ ${v}`);
  } else {
    lines.push('\nAll quotas OK.');
  }
  const over = report.perSession.filter(s => s.tooManyTabs);
  if (over.length) {
    lines.push('\nSessions exceeding per-session tab limit:');
    for (const s of over) lines.push(`  ${s.name}: ${s.count} tabs`);
  }
  return lines.join('\n');
}
