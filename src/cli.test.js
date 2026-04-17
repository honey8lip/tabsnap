'use strict';

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const saveScript = path.join(__dirname, 'cli-save.js');
const listScript = path.join(__dirname, 'cli-list.js');
const deleteScript = path.join(__dirname, 'cli-delete.js');

describe('cli-save.js', () => {
  test('exits with error when no session name given', () => {
    let err;
    try {
      execSync(`node ${saveScript}`, { stdio: 'pipe' });
    } catch (e) {
      err = e;
    }
    expect(err).toBeDefined();
    expect(err.stderr.toString()).toMatch(/Usage/);
  });
});

describe('cli-list.js', () => {
  test('runs without crashing when sessions dir is empty or missing', () => {
    const env = { ...process.env, TABSNAP_DIR: fs.mkdtempSync(path.join(os.tmpdir(), 'tabsnap-')) };
    const out = execSync(`node ${listScript}`, { env, stdio: 'pipe' });
    expect(out.toString()).toMatch(/No saved sessions/);
  });

  test('accepts --verbose flag', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tabsnap-'));
    const session = { name: 'test', browser: 'chrome', tabs: [], savedAt: new Date().toISOString() };
    fs.writeFileSync(path.join(tmpDir, 'test.json'), JSON.stringify(session));
    const env = { ...process.env, TABSNAP_DIR: tmpDir };
    const out = execSync(`node ${listScript} --verbose`, { env, stdio: 'pipe' });
    expect(out.toString()).toMatch(/test/);
  });
});

describe('cli-delete.js', () => {
  test('exits with error when no session name given', () => {
    let err;
    try {
      execSync(`node ${deleteScript}`, { stdio: 'pipe' });
    } catch (e) {
      err = e;
    }
    expect(err).toBeDefined();
    expect(err.stderr.toString()).toMatch(/Usage/);
  });

  test('exits with error when session not found', () => {
    const env = { ...process.env, TABSNAP_DIR: fs.mkdtempSync(path.join(os.tmpdir(), 'tabsnap-')) };
    let err;
    try {
      execSync(`node ${deleteScript} nonexistent --force`, { env, stdio: 'pipe' });
    } catch (e) {
      err = e;
    }
    expect(err).toBeDefined();
    expect(err.stderr.toString()).toMatch(/not found/);
  });
});
