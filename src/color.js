// Color/theme support for CLI output

const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
};

function isColorEnabled() {
  if (process.env.NO_COLOR || process.env.TABSNAP_NO_COLOR) return false;
  if (process.env.FORCE_COLOR) return true;
  return process.stdout.isTTY === true;
}

function colorize(text, ...styles) {
  if (!isColorEnabled()) return text;
  const codes = styles.map(s => COLORS[s] || '').join('');
  return `${codes}${text}${COLORS.reset}`;
}

function bold(text) { return colorize(text, 'bold'); }
function dim(text) { return colorize(text, 'dim'); }
function red(text) { return colorize(text, 'red'); }
function green(text) { return colorize(text, 'green'); }
function yellow(text) { return colorize(text, 'yellow'); }
function blue(text) { return colorize(text, 'blue'); }
function cyan(text) { return colorize(text, 'cyan'); }
function gray(text) { return colorize(text, 'gray'); }
function magenta(text) { return colorize(text, 'magenta'); }

function statusColor(status) {
  switch (status) {
    case 'ok': case 'saved': case 'success': return green(status);
    case 'warn': case 'warning': return yellow(status);
    case 'error': case 'fail': return red(status);
    default: return cyan(status);
  }
}

function formatLabel(label, value) {
  return `${gray(label + ':')} ${value}`;
}

module.exports = {
  isColorEnabled,
  colorize,
  bold,
  dim,
  red,
  green,
  yellow,
  blue,
  cyan,
  gray,
  magenta,
  statusColor,
  formatLabel,
};
