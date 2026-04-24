#!/usr/bin/env node
import { loadSchedule, saveSchedule } from './schedule.js';
import {
  checkReminders,
  formatReminder,
  addReminder,
  removeReminder,
  listReminders,
} from './remind.js';
import { parseInterval } from './schedule-utils.js';

export function printUsage() {
  console.log('Usage: tabsnap remind <subcommand> [options]');
  console.log('  check                  Check for upcoming reminders');
  console.log('  set <name> <interval>  Set reminder for a scheduled session');
  console.log('  remove <name>          Remove reminder from a session');
  console.log('  list                   List all sessions with reminders');
}

async function main() {
  const [sub, name, intervalArg] = process.argv.slice(2);
  const schedules = await loadSchedule();

  if (sub === 'check') {
    const reminders = checkReminders({}, schedules);
    if (reminders.length === 0) {
      console.log('No upcoming reminders.');
    } else {
      reminders.forEach((r) => console.log(formatReminder(r)));
    }
    return;
  }

  if (sub === 'list') {
    const list = listReminders(schedules);
    if (list.length === 0) {
      console.log('No reminders configured.');
    } else {
      list.forEach(({ name: n, remindBefore }) =>
        console.log(`${n}: ${remindBefore}s before`)
      );
    }
    return;
  }

  if (sub === 'set') {
    if (!name || !intervalArg) return printUsage();
    if (!schedules[name]) {
      console.error(`No schedule found for "${name}".`);
      process.exit(1);
    }
    const seconds = parseInterval(intervalArg);
    schedules[name] = addReminder(schedules[name], seconds);
    await saveSchedule(schedules);
    console.log(`Reminder set for "${name}": ${seconds}s before run.`);
    return;
  }

  if (sub === 'remove') {
    if (!name) return printUsage();
    if (!schedules[name]) {
      console.error(`No schedule found for "${name}".`);
      process.exit(1);
    }
    schedules[name] = removeReminder(schedules[name]);
    await saveSchedule(schedules);
    console.log(`Reminder removed from "${name}".`);
    return;
  }

  printUsage();
}

main().catch((e) => { console.error(e.message); process.exit(1); });
