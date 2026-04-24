import { listSessions, loadSession } from './storage.js';

/**
 * Build a profile summary for a named session collection (profile).
 * A profile is just a label stored in session metadata under `profile`.
 */
export function getProfileSessions(sessions, profileName) {
  return sessions.filter(s => s.profile === profileName);
}

export function listProfiles(sessions) {
  const profiles = new Set();
  for (const s of sessions) {
    if (s.profile) profiles.add(s.profile);
  }
  return [...profiles].sort();
}

export function assignProfile(session, profileName) {
  if (!profileName || typeof profileName !== 'string') {
    throw new Error('Profile name must be a non-empty string');
  }
  return { ...session, profile: profileName.trim() };
}

export function removeProfile(session) {
  const copy = { ...session };
  delete copy.profile;
  return copy;
}

export function profileSummary(sessions, profileName) {
  const members = getProfileSessions(sessions, profileName);
  const totalTabs = members.reduce((n, s) => n + (s.tabs ? s.tabs.length : 0), 0);
  return {
    name: profileName,
    sessionCount: members.length,
    totalTabs,
    sessions: members.map(s => s.name),
  };
}

export function formatProfileReport(summary) {
  const lines = [
    `Profile: ${summary.name}`,
    `  Sessions : ${summary.sessionCount}`,
    `  Total tabs: ${summary.totalTabs}`,
  ];
  if (summary.sessions.length) {
    lines.push('  Includes:');
    summary.sessions.forEach(n => lines.push(`    - ${n}`));
  }
  return lines.join('\n');
}
