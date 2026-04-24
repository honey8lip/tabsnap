/**
 * Utility helpers for reminder formatting and validation.
 */

export const REMIND_PRESETS = {
  '5m': 300,
  '10m': 600,
  '15m': 900,
  '30m': 1800,
  '1h': 3600,
};

export function resolveRemindBefore(value) {
  if (typeof value === 'number') return value;
  if (REMIND_PRESETS[value] !== undefined) return REMIND_PRESETS[value];
  const n = parseInt(value, 10);
  if (!isNaN(n) && n > 0) return n;
  throw new Error(`Invalid remind-before value: "${value}"`);
}

export function formatRemindBefore(seconds) {
  if (seconds >= 3600 && seconds % 3600 === 0) return `${seconds / 3600}h`;
  if (seconds >= 60 && seconds % 60 === 0) return `${seconds / 60}m`;
  return `${seconds}s`;
}

export function reminderSummary(reminders) {
  if (reminders.length === 0) return 'No active reminders.';
  const lines = reminders.map(
    (r) => `  • ${r.name}: due in ${formatRemindBefore(r.secondsAway)}`
  );
  return `Upcoming reminders (${reminders.length}):\n${lines.join('\n')}`;
}

export function sortReminders(reminders) {
  return [...reminders].sort((a, b) => a.secondsAway - b.secondsAway);
}
