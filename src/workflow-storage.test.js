const os = require('os');
const path = require('path');
const fs = require('fs');
const { saveWorkflow, loadWorkflow, listWorkflows, deleteWorkflow, workflowExists } = require('./workflow-storage');
const { createWorkflow, addStep } = require('./workflow');

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'tabsnap-wf-'));
}

test('saveWorkflow and loadWorkflow roundtrip', () => {
  const dir = tmpDir();
  let w = createWorkflow('morning');
  w = addStep(w, 'save');
  w = addStep(w, 'backup');
  saveWorkflow(dir, w);
  const loaded = loadWorkflow(dir, 'morning');
  expect(loaded.name).toBe('morning');
  expect(loaded.steps).toHaveLength(2);
});

test('saveWorkflow rejects invalid workflow', () => {
  const dir = tmpDir();
  expect(() => saveWorkflow(dir, { name: '', steps: [] })).toThrow();
});

test('loadWorkflow throws if not found', () => {
  const dir = tmpDir();
  expect(() => loadWorkflow(dir, 'ghost')).toThrow(/not found/);
});

test('listWorkflows returns names', () => {
  const dir = tmpDir();
  saveWorkflow(dir, createWorkflow('alpha'));
  saveWorkflow(dir, createWorkflow('beta'));
  const names = listWorkflows(dir);
  expect(names).toContain('alpha');
  expect(names).toContain('beta');
});

test('listWorkflows returns empty array when no workflows', () => {
  const dir = tmpDir();
  expect(listWorkflows(dir)).toEqual([]);
});

test('deleteWorkflow removes file', () => {
  const dir = tmpDir();
  saveWorkflow(dir, createWorkflow('temp'));
  deleteWorkflow(dir, 'temp');
  expect(workflowExists(dir, 'temp')).toBe(false);
});

test('deleteWorkflow throws if not found', () => {
  const dir = tmpDir();
  expect(() => deleteWorkflow(dir, 'nope')).toThrow();
});

test('workflowExists returns true/false correctly', () => {
  const dir = tmpDir();
  expect(workflowExists(dir, 'x')).toBe(false);
  saveWorkflow(dir, createWorkflow('x'));
  expect(workflowExists(dir, 'x')).toBe(true);
});
