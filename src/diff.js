const { diffSnapshots } = require('./snapshot');

function diffSessions(sessionA, sessionB) {
  const urlsA = new Set(sessionA.tabs.map(t => t.url));
  const urlsB = new Set(sessionB.tabs.map(t => t.url));

  const added = sessionB.tabs.filter(t => !urlsA.has(t.url));
  const removed = sessionA.tabs.filter(t => !urlsB.has(t.url));
  const kept = sessionA.tabs.filter(t => urlsB.has(t.url));

  return { added, removed, kept };
}

function formatDiff(diff, opts = {}) {
  const lines = [];
  const { color = true } = opts;

  const green = s => color ? `\x1b[32m${s}\x1b[0m` : s;
  const red = s => color ? `\x1b[31m${s}\x1b[0m` : s;
  const dim = s => color ? `\x1b[2m${s}\x1b[0m` : s;

  if (diff.added.length === 0 && diff.removed.length === 0) {
    lines.push(dim('No differences found.'));
    return lines.join('\n');
  }

  for (const tab of diff.added) {
    lines.push(green(`+ ${tab.title || tab.url}`));
    lines.push(green(`  ${tab.url}`));
  }

  for (const tab of diff.removed) {
    lines.push(red(`- ${tab.title || tab.url}`));
    lines.push(red(`  ${tab.url}`));
  }

  lines.push('');
  lines.push(`${diff.added.length} added, ${diff.removed.length} removed, ${diff.kept.length} unchanged`);

  return lines.join('\n');
}

function diffSummary(diff) {
  return {
    added: diff.added.length,
    removed: diff.removed.length,
    kept: diff.kept.length,
    changed: diff.added.length > 0 || diff.removed.length > 0,
  };
}

module.exports = { diffSessions, formatDiff, diffSummary };
