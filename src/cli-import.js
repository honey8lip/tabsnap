#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { parseHtmlBookmarks, parseMarkdown } = require('./import');
const { saveSession } = require('./storage');

function printUsage() {
  console.log('Usage: tabsnap import <file> [session-name]');
  console.log('');
  console.log('Supported formats:');
  console.log('  .html   Netscape bookmark file');
  console.log('  .md     Markdown list of links');
  console.log('');
  console.log('Examples:');
  console.log('  tabsnap import bookmarks.html work');
  console.log('  tabsnap import links.md research');
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printUsage();
    process.exit(0);
  }

  const filePath = args[0];
  const sessionName = args[1] || path.basename(filePath, path.extname(filePath));

  if (!fs.existsSync(filePath)) {
    console.error(`Error: file not found: ${filePath}`);
    process.exit(1);
  }

  const ext = path.extname(filePath).toLowerCase();
  const content = fs.readFileSync(filePath, 'utf8');

  let tabs;
  try {
    if (ext === '.html' || ext === '.htm') {
      tabs = parseHtmlBookmarks(content);
    } else if (ext === '.md') {
      tabs = parseMarkdown(content);
    } else {
      console.error(`Error: unsupported file format: ${ext}`);
      console.error('Supported formats: .html, .md');
      process.exit(1);
    }
  } catch (err) {
    console.error(`Error parsing file: ${err.message}`);
    process.exit(1);
  }

  if (tabs.length === 0) {
    console.error('No tabs found in file.');
    process.exit(1);
  }

  const session = {
    name: sessionName,
    savedAt: new Date().toISOString(),
    browser: 'imported',
    tabs
  };

  await saveSession(sessionName, session);
  console.log(`Imported ${tabs.length} tab(s) as session "${sessionName}".`);
}

main();
