export function parseBackupName(name) {
  const match = name.match(/^(.+)_backup_(\d{4}-\d{2}-\d{2}T.+)$/);
  if (!match) return null;
  return { original: match[1], timestamp: match[2].replace(/-/g, ':').replace('T', 'T') };
}

export function formatBackupAge(timestamp) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function sortBackups(backups) {
  return [...backups].sort((a, b) => {
    const pa = parseBackupName(a);
    const pb = parseBackupName(b);
    if (!pa || !pb) return 0;
    return pa.timestamp.localeCompare(pb.timestamp);
  });
}

export function validateKeepCount(n) {
  const v = parseInt(n, 10);
  if (isNaN(v) || v < 1) throw new Error('Keep count must be a positive integer');
  return v;
}
