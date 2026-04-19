// Template support: save/load named session templates
const { loadSession, saveSession, listSessions } = require('./storage');

function applyTemplate(template, name) {
  const session = {
    ...template,
    name,
    createdAt: new Date().toISOString(),
    fromTemplate: template.name,
  };
  delete session.name;
  session.name = name;
  return session;
}

function extractTemplate(session, templateName) {
  return {
    name: templateName,
    tabs: session.tabs,
    tags: session.tags || [],
    isTemplate: true,
    createdAt: new Date().toISOString(),
  };
}

async function saveTemplate(sessionsDir, templateName, session) {
  const template = extractTemplate(session, templateName);
  await saveSession(sessionsDir, `__template__${templateName}`, template);
  return template;
}

async function loadTemplate(sessionsDir, templateName) {
  return loadSession(sessionsDir, `__template__${templateName}`);
}

async function listTemplates(sessionsDir) {
  const all = await listSessions(sessionsDir);
  return all
    .filter(n => n.startsWith('__template__'))
    .map(n => n.replace('__template__', ''));
}

async function instantiateTemplate(sessionsDir, templateName, newName) {
  const template = await loadTemplate(sessionsDir, templateName);
  if (!template) throw new Error(`Template not found: ${templateName}`);
  const session = applyTemplate(template, newName);
  await saveSession(sessionsDir, newName, session);
  return session;
}

module.exports = { extractTemplate, applyTemplate, saveTemplate, loadTemplate, listTemplates, instantiateTemplate };
