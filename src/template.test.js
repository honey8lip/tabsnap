const { extractTemplate, applyTemplate, saveTemplate, loadTemplate, listTemplates, instantiateTemplate } = require('./template');
const { saveSession, loadSession } = require('./storage');
const os = require('os');
const path = require('path');
const fs = require('fs/promises');

let tmpDir;
beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tabsnap-tmpl-'));
});

const fakeSession = {
  name: 'work',
  tabs: [{ title: 'GitHub', url: 'https://github.com' }],
  tags: ['dev'],
};

test('extractTemplate builds template object', () => {
  const tmpl = extractTemplate(fakeSession, 'mytemplate');
  expect(tmpl.name).toBe('mytemplate');
  expect(tmpl.isTemplate).toBe(true);
  expect(tmpl.tabs).toEqual(fakeSession.tabs);
});

test('applyTemplate creates session from template', () => {
  const tmpl = extractTemplate(fakeSession, 'mytemplate');
  const session = applyTemplate(tmpl, 'newsession');
  expect(session.name).toBe('newsession');
  expect(session.fromTemplate).toBe('mytemplate');
  expect(session.tabs).toEqual(fakeSession.tabs);
});

test('saveTemplate and loadTemplate round-trip', async () => {
  await saveTemplate(tmpDir, 'mytemplate', fakeSession);
  const loaded = await loadTemplate(tmpDir, 'mytemplate');
  expect(loaded.isTemplate).toBe(true);
  expect(loaded.tabs).toEqual(fakeSession.tabs);
});

test('listTemplates returns only templates', async () => {
  await saveTemplate(tmpDir, 'tmplA', fakeSession);
  await saveTemplate(tmpDir, 'tmplB', fakeSession);
  await saveSession(tmpDir, 'regular', fakeSession);
  const templates = await listTemplates(tmpDir);
  expect(templates).toContain('tmplA');
  expect(templates).toContain('tmplB');
  expect(templates).not.toContain('regular');
});

test('instantiateTemplate creates new session', async () => {
  await saveTemplate(tmpDir, 'base', fakeSession);
  const session = await instantiateTemplate(tmpDir, 'base', 'mywork');
  expect(session.name).toBe('mywork');
  expect(session.fromTemplate).toBe('base');
});

test('instantiateTemplate throws for missing template', async () => {
  await expect(instantiateTemplate(tmpDir, 'nope', 'x')).rejects.toThrow('Template not found');
});
