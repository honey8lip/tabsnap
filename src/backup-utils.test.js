import { describe, it, expect } from 'vitest';
import { parseBackupName, sortBackups, validateKeepCount } from './backup-utils.js';

describe('parseBackupName', () => {
  it('parses valid backup name', () => {
    const result = parseBackupName('work_backup_2024-01-15T10-30-00-000Z');
    expect(result).not.toBeNull();
    expect(result.original).toBe('work');
  });
  it('returns null for non-backup names', () => {
    expect(parseBackupName('work')).toBeNull();
  });
});

describe('sortBackups', () => {
  it('sorts backups by timestamp', () => {
    const backups = ['work_backup_2024-01-02T00-00-00', 'work_backup_2024-01-01T00-00-00'];
    const sorted = sortBackups(backups);
    expect(sorted[0]).toContain('01-01');
  });
});

describe('validateKeepCount', () => {
  it('returns parsed int for valid input', () => {
    expect(validateKeepCount('3')).toBe(3);
  });
  it('throws for invalid input', () => {
    expect(() => validateKeepCount('abc')).toThrow();
    expect(() => validateKeepCount('0')).toThrow();
  });
});
