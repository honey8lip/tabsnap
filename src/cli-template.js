#!/usr/bin/env node
const path = require('path');
const { saveTemplate, loadTemplate, listTemplates, instantiateTemplate } = require('./template');
const { loadSession } = require('./storage');

const SESSIONS_DIR = path.join(process.env.HOME || '.', '.tabsnap', 'sessions');

function printUsage() {
  console.log('Usage: tabsnap template <subcommand> [args]');
  console.log('  save <session> <template-name>   Save session as a template');
  console.log('  list                             List all templates');
  console.log('  use <template-name> <new-name>   Create session from template');
  console.log('  show <template-name>             Show template tabs');
}

async function main() {
  const [,, , sub, arg1, arg2] = process.argv;
  if (!sub) return printUsage();

  if (sub === 'list') {
    const templates = await listTemplates(SESSIONS_DIR);
    if (!templates.length) return console.log('No templates saved.');
    templates.forEach(t => console.log(' -', t));
    return;
  }

  if (sub === 'save') {
    if (!arg1 || !arg2) return printUsage();
    const session = await loadSession(SESSIONS_DIR, arg1);
    if (!session) return console.error(`Session not found: ${arg1}`);
    await saveTemplate(SESSIONS_DIR, arg2, session);
    console.log(`Saved template '${arg2}' from session '${arg1}'.`);
    return;
  }

  if (sub === 'use') {
    if (!arg1 || !arg2) return printUsage();
    try {
      const session = await instantiateTemplate(SESSIONS_DIR, arg1, arg2);
      console.log(`Created session '${arg2}' from template '${arg1}' (${session.tabs.length} tabs).`);
    } catch (e) {
      console.error(e.message);
    }
    return;
  }

  if (sub === 'show') {
    if (!arg1) return printUsage();
    const tmpl = await loadTemplate(SESSIONS_DIR, arg1);
    if (!tmpl) return console.error(`Template not found: ${arg1}`);
    console.log(`Template: ${arg1} (${tmpl.tabs.length} tabs)`);
    tmpl.tabs.forEach(t => console.log(` - ${t.title}: ${t.url}`));
    return;
  }

  printUsage();
}

main().catch(e => { console.error(e.message); process.exit(1); });
