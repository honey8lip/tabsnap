// workflow.js — named multi-step sequences of tabsnap operations

const VALID_STEPS = ['save', 'archive', 'dedupe', 'tag', 'export', 'backup'];

function createWorkflow(name, steps = []) {
  if (!name || typeof name !== 'string') throw new Error('Workflow name required');
  const invalid = steps.filter(s => !VALID_STEPS.includes(s.action));
  if (invalid.length) throw new Error(`Unknown actions: ${invalid.map(s => s.action).join(', ')}`);
  return { name, steps, createdAt: new Date().toISOString() };
}

function addStep(workflow, action, options = {}) {
  if (!VALID_STEPS.includes(action)) throw new Error(`Unknown action: ${action}`);
  return { ...workflow, steps: [...workflow.steps, { action, options }] };
}

function removeStep(workflow, index) {
  if (index < 0 || index >= workflow.steps.length) throw new Error('Step index out of range');
  const steps = workflow.steps.filter((_, i) => i !== index);
  return { ...workflow, steps };
}

function reorderSteps(workflow, fromIndex, toIndex) {
  const steps = [...workflow.steps];
  const [moved] = steps.splice(fromIndex, 1);
  steps.splice(toIndex, 0, moved);
  return { ...workflow, steps };
}

function validateWorkflow(workflow) {
  const errors = [];
  if (!workflow.name) errors.push('Missing name');
  if (!Array.isArray(workflow.steps)) errors.push('Steps must be an array');
  else {
    workflow.steps.forEach((s, i) => {
      if (!VALID_STEPS.includes(s.action)) errors.push(`Step ${i}: unknown action '${s.action}'`);
    });
  }
  return { valid: errors.length === 0, errors };
}

function formatWorkflow(workflow) {
  const lines = [`Workflow: ${workflow.name}`, `Steps: ${workflow.steps.length}`];
  workflow.steps.forEach((s, i) => {
    const opts = Object.keys(s.options || {}).length
      ? ' (' + Object.entries(s.options).map(([k, v]) => `${k}=${v}`).join(', ') + ')'
      : '';
    lines.push(`  ${i + 1}. ${s.action}${opts}`);
  });
  return lines.join('\n');
}

module.exports = { createWorkflow, addStep, removeStep, reorderSteps, validateWorkflow, formatWorkflow, VALID_STEPS };
