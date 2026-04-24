import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

export function parseSyncTarget(raw) {
  if (!raw) return null;
  if (raw.startsWith('file://')) return { type: 'file', path: raw.slice(7) };
  if (raw.startsWith('http://') || raw.startsWith('https://')) return { type: 'http', url: raw };
  return { type: 'file', path: raw };
}

export function validateBundle(bundle) {
  if (!bundle || typeof bundle !== 'object') return 'Bundle must be an object';
  if (bundle.version !== 1) return `Unsupported bundle version: ${bundle.version}`;
  if (!bundle.sessions || typeof bundle.sessions !== 'object') return 'Bundle missing sessions map';
  return null;
}

export function readBundleFile(filePath) {
  const abs = resolve(filePath);
  if (!existsSync(abs)) throw new Error(`Bundle file not found: ${abs}`);
  const raw = readFileSync(abs, 'utf8');
  return JSON.parse(raw);
}

export function formatBundleAge(bundle) {
  if (!bundle.exported) return 'unknown age';
  const ms = Date.now() - new Date(bundle.exported).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function bundleSummary(bundle) {
  const count = Object.keys(bundle.sessions || {}).length;
  const age = formatBundleAge(bundle);
  return `${count} session(s), exported ${age}`;
}
