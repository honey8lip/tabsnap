import { loadSession } from './storage.js';
import { loadSchedule } from './schedule.js';
import { formatInterval } from './schedule-utils.js';

export function checkReminders(sessions, schedules, now = new Date()) {
  const reminders = [];
  for (const name of Object.keys(schedules)) {
    const sched = schedules[name];
    if (!sched.remindBefore) continue;
    const nextRun = new Date(sched.nextRun);
    const diff = nextRun - now;
    if (diff > 0 && diff <= sched.remindBefore * 1000) {
      reminders.push({ name, nextRun, secondsAway: Math.round(diff / 1000) });
    }
  }
  return reminders;
}

export function formatReminder(reminder) {
  const { name, secondsAway } = reminder;
  const timeStr = formatInterval(secondsAway);
  return `Session "${name}" is scheduled to run in ${timeStr}.`;
}

export function addReminder(schedule, secondsBefore) {
  if (typeof secondsBefore !== 'number' || secondsBefore <= 0) {
    throw new Error('remindBefore must be a positive number of seconds');
  }
  return { ...schedule, remindBefore: secondsBefore };
}

export function removeReminder(schedule) {
  const updated = { ...schedule };
  delete updated.remindBefore;
  return updated;
}

export function hasReminder(schedule) {
  return typeof schedule.remindBefore === 'number' && schedule.remindBefore > 0;
}

export function listReminders(schedules) {
  return Object.entries(schedules)
    .filter(([, s]) => hasReminder(s))
    .map(([name, s]) => ({ name, remindBefore: s.remindBefore }));
}
