const {
  isColorEnabled,
  colorize,
  bold,
  red,
  green,
  yellow,
  cyan,
  gray,
  statusColor,
  formatLabel,
} = require('./color');

beforeEach(() => {
  delete process.env.NO_COLOR;
  delete process.env.FORCE_COLOR;
  delete process.env.TABSNAP_NO_COLOR;
});

test('isColorEnabled returns false when NO_COLOR set', () => {
  process.env.NO_COLOR = '1';
  expect(isColorEnabled()).toBe(false);
});

test('isColorEnabled returns false when TABSNAP_NO_COLOR set', () => {
  process.env.TABSNAP_NO_COLOR = '1';
  expect(isColorEnabled()).toBe(false);
});

test('isColorEnabled returns true when FORCE_COLOR set', () => {
  process.env.FORCE_COLOR = '1';
  expect(isColorEnabled()).toBe(true);
});

test('colorize returns plain text when color disabled', () => {
  process.env.NO_COLOR = '1';
  expect(colorize('hello', 'red')).toBe('hello');
});

test('colorize wraps text with escape codes when forced', () => {
  process.env.FORCE_COLOR = '1';
  const result = colorize('hi', 'green');
  expect(result).toContain('hi');
  expect(result).toContain('\x1b[');
  expect(result).toContain('\x1b[0m');
});

test('bold, red, green helpers work without color', () => {
  process.env.NO_COLOR = '1';
  expect(bold('text')).toBe('text');
  expect(red('text')).toBe('text');
  expect(green('text')).toBe('text');
});

test('statusColor returns correct color for known statuses', () => {
  process.env.FORCE_COLOR = '1';
  expect(statusColor('ok')).toContain('ok');
  expect(statusColor('error')).toContain('error');
  expect(statusColor('warn')).toContain('warn');
});

test('statusColor handles unknown status with cyan', () => {
  process.env.FORCE_COLOR = '1';
  const result = statusColor('pending');
  expect(result).toContain('pending');
});

test('formatLabel formats label and value', () => {
  process.env.NO_COLOR = '1';
  const result = formatLabel('name', 'work');
  expect(result).toContain('name:');
  expect(result).toContain('work');
});
