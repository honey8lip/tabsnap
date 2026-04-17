#!/usr/bin/env node
'use strict';

const { detectBrowser, isRunning, parseTabs, formatSession } = require('./browser');
const { saveSession } = require('./storage');
const { summarize } = require('./capture');

async function main() {
  const args = process.argv.slice(2);
  const name = args[0];

  if (!name) {
    console.error('Usage: tabsnap save <session-name>');
    process.exit(1);
  }

  const browser = detectBrowser();
  if (!browser) {
    console.error('No supported browser detected.');
    process.exit(1);
  }

  if (!isRunning(browser)) {
    console.error(`${browser} does not appear to be running.`);
    process.exit(1);
  }

  let tabs;
  try {
    tabs = await parseTabs(browser);
  } catch (err) {
    console.error('Failed to read tabs:', err.message);
    process.exit(1);
  }

  if (!tabs || tabs.length === 0) {
    console.error('No open tabs found.');
    process.exit(1);
  }

  const session = formatSession(name, browser, tabs);

  try {
    const filePath = await saveSession(name, session);
    console.log(`Saved ${tabs.length} tabs to "${name}" (${filePath})`);
    console.log(summarize(session));
  } catch (err) {
    console.error('Failed to save session:', err.message);
    process.exit(1);
  }
}

main();
