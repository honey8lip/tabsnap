const path = require('path');
const os = require('os');
const fs = require('fs/promises');
const { saveTemplate, listTemplates } = require('./template');
const { saveSession } = require('./storage');

let tmpDir;
beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tabsnap-clitmpl-'));
});

const fakeSession = {
  name: 'work',
  tabs: [
    { title: 'GitHub', url: 'https://github.com' },
    { title: 'Docs', url: 'https://docs.example.com' },
  ],
  tags: ['dev'],
};

test('listTemplates returns empty array when none exist', async () => {
  const templates = await listTemplates(tmpDir);
  expect(templates).toEqual([]);
});

test('saveTemplate then listTemplates finds it', async () => {
  await saveTemplate(tmpDir, 'devsetup', fakeSession);
  const list = await listTemplates(tmpDir);
  expect(list).toContain('devsetup');
});

test('regular sessions not mixed with templates', async () => {
  await saveSession(tmpDir, 'mywork', fakeSession);
  await saveTemplate(tmpDir, 'devsetup', fakeSession);
  const list = await listTemplates(tmpDir);
  expect(list).not.toContain('mywork');
  expect(list).toContain('devsetup');
});
