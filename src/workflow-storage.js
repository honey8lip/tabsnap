// workflow-storage.js — persist/load named workflows alongside sessions

const fs = require('fs');
const path = require('path');
const { ensureDir } = require('./storage');
const { validateWorkflow } = require('./workflow');

function workflowDir(baseDir) {
  return path.join(baseDir, 'workflows');
}

function workflowPath(baseDir, name) {
  return path.join(workflowDir(baseDir), `${name}.json`);
}

function saveWorkflow(baseDir, workflow) {
  const { valid, errors } = validateWorkflow(workflow);
  if (!valid) throw new Error(`Invalid workflow: ${errors.join('; ')}`);
  ensureDir(workflowDir(baseDir));
  fs.writeFileSync(workflowPath(baseDir, workflow.name), JSON.stringify(workflow, null, 2));
}

function loadWorkflow(baseDir, name) {
  const p = workflowPath(baseDir, name);
  if (!fs.existsSync(p)) throw new Error(`Workflow not found: ${name}`);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function listWorkflows(baseDir) {
  const dir = workflowDir(baseDir);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace(/\.json$/, ''));
}

function deleteWorkflow(baseDir, name) {
  const p = workflowPath(baseDir, name);
  if (!fs.existsSync(p)) throw new Error(`Workflow not found: ${name}`);
  fs.unlinkSync(p);
}

function workflowExists(baseDir, name) {
  return fs.existsSync(workflowPath(baseDir, name));
}

module.exports = { saveWorkflow, loadWorkflow, listWorkflows, deleteWorkflow, workflowExists };
