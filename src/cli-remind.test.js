import { describe, it, mock, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { checkReminders, formatReminder, listReminders } from './remind.js';

describe('cli-remind integration helpers', () => {
  const now = new Date('2024-06-01T12:00:00Z');

  describe('checkReminders + formatReminder pipeline', () => {
    it('produces formatted output for due reminders', () => {
      const schedules = {
        daily: { nextRun: '2024-06-01T12:03:00Z', remindBefore: 300 },
      };
      const reminders = checkReminders({}, schedules, now);
      assert.equal(reminders.length, 1);
      const msg = formatReminder(reminders[0]);
      assert.ok(typeof msg === 'string');
      assert.ok(msg.includes('daily'));
    });

    it('returns empty list when nothing is due', () => {
      const schedules = {
        weekly: { nextRun: '2024-06-08T12:00:00Z', remindBefore: 60 },
      };
      const reminders = checkReminders({}, schedules, now);
      assert.equal(reminders.length, 0);
    });
  });

  describe('listReminders', () => {
    it('returns structured list for CLI display', () => {
      const schedules = {
        a: { remindBefore: 120 },
        b: { nextRun: '2024-06-02T00:00:00Z' },
      };
      const list = listReminders(schedules);
      assert.equal(list.length, 1);
      assert.equal(list[0].name, 'a');
      assert.equal(list[0].remindBefore, 120);
    });

    it('returns empty array when no reminders exist', () => {
      assert.deepEqual(listReminders({}), []);
    });
  });
});
