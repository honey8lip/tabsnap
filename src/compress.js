import { gzipSync, gunzipSync } from 'zlib';
import { readFileSync, writeFileSync } from 'fs';
import { loadSession, saveSession } from './storage.js';

export function compressSession(session) {
  const json = JSON.stringify(session);
  const compressed = gzipSync(Buffer.from(json, 'utf8'));
  return compressed.toString('base64');
}

export function decompressSession(data) {
  const buffer = Buffer.from(data, 'base64');
  const decompressed = gunzipSync(buffer);
  return JSON.parse(decompressed.toString('utf8'));
}

export function compressSummary(original, compressed) {
  const originalSize = Buffer.byteLength(original, 'utf8');
  const compressedSize = Buffer.byteLength(compressed, 'base64');
  const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1);
  return {
    originalBytes: originalSize,
    compressedBytes: compressedSize,
    ratio: parseFloat(ratio),
    saved: originalSize - compressedSize
  };
}

export function packSession(session) {
  const json = JSON.stringify(session);
  const compressedData = compressSession(session);
  const summary = compressSummary(json, compressedData);
  return {
    __compressed: true,
    __version: 1,
    data: compressedData,
    meta: {
      name: session.name,
      savedAt: session.savedAt,
      tabCount: session.tabs ? session.tabs.length : 0,
      ...summary
    }
  };
}

export function unpackSession(packed) {
  if (!packed.__compressed) return packed;
  return decompressSession(packed.data);
}

export function isCompressed(session) {
  return session && session.__compressed === true;
}
