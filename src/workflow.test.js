const { createWorkflow, addStep, removeStep, reorderSteps, validateWorkflow, formatWorkflow } = require('./workflow');

test('createWorkflow returns valid object', () => {
  const w = createWorkflow('daily');
  expect(w.name).toBe('daily');
  expect(w.steps).toEqual([]);
  expect(w.createdAt).toBeTruthy();
});

test('createWorkflow throws on missing name', () => {
  expect(() => createWorkflow('')).toThrow();
});

test('createWorkflow throws on unknown step action', () => {
  expect(() => createWorkflow('x', [{ action: 'fly' }])).toThrow(/Unknown actions/);
});

test('addStep appends a step', () => {
  const w = createWorkflow('w');
  const w2 = addStep(w, 'save', { session: 'morning' });
  expect(w2.steps).toHaveLength(1);
  expect(w2.steps[0].action).toBe('save');
  expect(w2.steps[0].options.session).toBe('morning');
});

test('addStep throws on unknown action', () => {
  const w = createWorkflow('w');
  expect(() => addStep(w, 'teleport')).toThrow();
});

test('removeStep removes by index', () => {
  let w = createWorkflow('w');
  w = addStep(w, 'save');
  w = addStep(w, 'archive');
  const w2 = removeStep(w, 0);
  expect(w2.steps).toHaveLength(1);
  expect(w2.steps[0].action).toBe('archive');
});

test('removeStep throws on bad index', () => {
  const w = createWorkflow('w');
  expect(() => removeStep(w, 5)).toThrow();
});

test('reorderSteps moves step', () => {
  let w = createWorkflow('w');
  w = addStep(w, 'save');
  w = addStep(w, 'tag');
  w = addStep(w, 'export');
  const w2 = reorderSteps(w, 2, 0);
  expect(w2.steps[0].action).toBe('export');
  expect(w2.steps[1].action).toBe('save');
});

test('validateWorkflow catches errors', () => {
  const r = validateWorkflow({ name: '', steps: [{ action: 'bad' }] });
  expect(r.valid).toBe(false);
  expect(r.errors.length).toBeGreaterThan(0);
});

test('formatWorkflow returns readable string', () => {
  let w = createWorkflow('nightly');
  w = addStep(w, 'backup', { keep: 5 });
  const out = formatWorkflow(w);
  expect(out).toContain('nightly');
  expect(out).toContain('backup');
  expect(out).toContain('keep=5');
});
