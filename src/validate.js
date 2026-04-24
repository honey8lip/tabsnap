import { listSessions, loadSession } from './storage.js';

/**
 * Validate a single session object structure
 */
export function validateSession(session) {
  const errors = [];

  if (!session || typeof session !== 'object') {
    return ['Session must be a non-null object'];
  }

  if (!session.name || typeof session.name !== 'string') {
    errors.push('Missing or invalid field: name');
  }

  if (!session.savedAt || isNaN(Date.parse(session.savedAt))) {
    errors.push('Missing or invalid field: savedAt');
  }

  if (!Array.isArray(session.tabs)) {
    errors.push('Missing or invalid field: tabs (must be array)');
  } else {
    session.tabs.forEach((tab, i) => {
      if (!tab.url || typeof tab.url !== 'string') {
        errors.push(`Tab[${i}] missing or invalid field: url`);
      }
      if (!tab.title || typeof tab.title !== 'string') {
        errors.push(`Tab[${i}] missing or invalid field: title`);
      }
    });
  }

  return errors;
}

/**
 * Validate all sessions in storage and return a report
 */
export async function validateAll(dir) {
  const names = await listSessions(dir);
  const report = [];

  for (const name of names) {
    try {
      const session = await loadSession(dir, name);
      const errors = validateSession(session);
      report.push({ name, valid: errors.length === 0, errors });
    } catch (err) {
      report.push({ name, valid: false, errors: [`Failed to load: ${err.message}`] });
    }
  }

  return report;
}

/**
 * Format validation report as human-readable string
 */
export function formatReport(report) {
  if (report.length === 0) return 'No sessions found.';

  const lines = [];
  let validCount = 0;

  for (const entry of report) {
    if (entry.valid) {
      lines.push(`  ✓ ${entry.name}`);
      validCount++;
    } else {
      lines.push(`  ✗ ${entry.name}`);
      entry.errors.forEach(e => lines.push(`      - ${e}`));
    }
  }

  lines.push('');
  lines.push(`${validCount}/${report.length} sessions valid.`);
  return lines.join('\n');
}
