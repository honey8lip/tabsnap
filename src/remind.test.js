import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  checkReminders,
  formatReminder,
  addReminder,
  removeReminder,
  hasReminder,
  listReminders,
} from './remind.js';

const now = new Date('2024-06-01T12:00:00Z');

describe('checkReminders', () => {
  it('returns reminders due within window', () => {
    const schedules = {
      work: { nextRun: '2024-06-01T12:04:00Z', remindBefore: 300 },
    };
    const result = checkReminders({}, schedules, now);
    assert.equal(result.length, 1);
    assert.equal(result[0].name, 'work');
    assert.ok(result[0].secondsAway <= 300);
  });

  it('ignores schedules without remindBefore', () => {
    const schedules = { work: { nextRun: '2024-06-01T12:04:00Z' } };
    assert.deepEqual(checkReminders({}, schedules, now), []);
  });

  it('ignores past nextRun', () => {
    const schedules = {
      old: { nextRun: '2024-06-01T11:00:00Z', remindBefore: 300 },
    };
    assert.deepEqual(checkReminders({}, schedules, now), []);
  });
});

describe('formatReminder', () => {
  it('formats a reminder message', () => {
    const msg = formatReminder({ name: 'work', secondsAway: 120 });
    assert.ok(msg.includes('work'));
    assert.ok(msg.includes('2 minutes') || msg.includes('120'));
  });
});

describe('addReminder / removeReminder', () => {
  it('adds remindBefore field', () => {
    const s = addReminder({}, 60);
    assert.equal(s.remindBefore, 60);
  });

  it('throws for invalid value', () => {
    assert.throws(() => addReminder({}, -1));
  });

  it('removes remindBefore field', () => {
    const s = removeReminder({ remindBefore: 60 });
    assert.equal(s.remindBefore, undefined);
  });
});

describe('listReminders', () => {
  it('lists only schedules with reminders', () => {
    const schedules = {
      a: { remindBefore: 60 },
      b: {},
      c: { remindBefore: 300 },
    };
    const result = listReminders(schedules);
    assert.equal(result.length, 2);
    assert.ok(result.every((r) => r.remindBefore > 0));
  });
});
