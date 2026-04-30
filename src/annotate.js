// annotate.js — attach, retrieve, and remove inline annotations on sessions

export function setAnnotation(session, key, value) {
  if (!session || typeof key !== 'string' || !key.trim()) {
    throw new Error('Invalid session or annotation key');
  }
  const annotations = session.annotations || {};
  return {
    ...session,
    annotations: { ...annotations, [key.trim()]: value }
  };
}

export function removeAnnotation(session, key) {
  if (!session || !session.annotations) return session;
  const annotations = { ...session.annotations };
  delete annotations[key];
  return { ...session, annotations };
}

export function getAnnotation(session, key) {
  return session?.annotations?.[key] ?? null;
}

export function hasAnnotation(session, key) {
  return Object.prototype.hasOwnProperty.call(session?.annotations || {}, key);
}

export function listAnnotations(session) {
  return Object.entries(session?.annotations || {}).map(([key, value]) => ({ key, value }));
}

export function clearAnnotations(session) {
  const { annotations: _dropped, ...rest } = session;
  return rest;
}

export function filterByAnnotation(sessions, key, value) {
  return sessions.filter(s => {
    if (!hasAnnotation(s, key)) return false;
    if (value === undefined) return true;
    return s.annotations[key] === value;
  });
}

export function formatAnnotations(session) {
  const entries = listAnnotations(session);
  if (entries.length === 0) return '(no annotations)';
  return entries.map(({ key, value }) => `  ${key}: ${value}`).join('\n');
}
