#!/usr/bin/env node
import { writeFileSync } from 'fs';
import { exportSession } from './export.js';

const args = process.argv.slice(2);

const VALID_FORMATS = ['json', 'html', 'markdown'];

function printUsage() {
  console.log('Usage: tabsnap export <session-name> [--format json|html|markdown] [--out file]');
  process.exit(1);
}

if (args.length === 0) printUsage();

const name = args[0];
let format = 'json';
let outFile = null;

for (let i = 1; i < args.length; i++) {
  if ((args[i] === '--format' || args[i] === '-f') && args[i + 1]) {
    format = args[++i];
    if (!VALID_FORMATS.includes(format)) {
      console.error(`Error: Invalid format "${format}". Must be one of: ${VALID_FORMATS.join(', ')}`);
      process.exit(1);
    }
  } else if ((args[i] === '--out' || args[i] === '-o') && args[i + 1]) {
    outFile = args[++i];
  } else {
    printUsage();
  }
}

try {
  const output = await exportSession(name, format);
  if (outFile) {
    writeFileSync(outFile, output, 'utf8');
    console.log(`Exported session "${name}" to ${outFile} (${format})`);
  } else {
    console.log(output);
  }
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}
