export function snapshotName(prefix = 'snapshot') {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 5).replace(':', '');
  return `${prefix}-${date}-${time}`;
}

export function formatDiff(diff) {
  const lines = [];
  if (diff.added.length) {
    lines.push('Added:');
    diff.added.forEach(t => lines.push(`  + ${t.title || t.url}`));
  }
  if (diff.removed.length) {
    lines.push('Removed:');
    diff.removed.forEach(t => lines.push(`  - ${t.title || t.url}`));
  }
  if (!diff.added.length && !diff.removed.length) {
    lines.push('No changes between snapshots.');
  }
  return lines.join('\n');
}

export function snapshotSummary(session) {
  return {
    name: session.name,
    tabCount: session.tabs.length,
    tags: session.tags || [],
    notes: session.notes || '',
    snapshotAt: session.snapshotAt || null,
  };
}
