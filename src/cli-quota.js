#!/usr/bin/env node
import path from 'path';
import os from 'os';
import { quotaReport, formatQuotaReport, DEFAULT_QUOTA } from './quota.js';

const DEFAULT_DIR = path.join(os.homedir(), '.tabsnap');

export function printUsage() {
  console.log('Usage: tabsnap quota [options]');
  console.log('');
  console.log('Options:');
  console.log('  --dir <path>          sessions directory (default: ~/.tabsnap)');
  console.log('  --max-sessions <n>    override max sessions (default: 100)');
  console.log('  --max-tabs <n>        override max total tabs (default: 5000)');
  console.log('  --max-storage <mb>    override max storage in MB (default: 50)');
  console.log('  --json                output raw JSON report');
  console.log('  --help                show this help');
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help')) {
    printUsage();
    process.exit(0);
  }

  const dir = args.includes('--dir')
    ? args[args.indexOf('--dir') + 1]
    : DEFAULT_DIR;

  const quota = { ...DEFAULT_QUOTA };

  if (args.includes('--max-sessions')) {
    quota.maxSessions = parseInt(args[args.indexOf('--max-sessions') + 1], 10);
  }
  if (args.includes('--max-tabs')) {
    quota.maxTotalTabs = parseInt(args[args.indexOf('--max-tabs') + 1], 10);
  }
  if (args.includes('--max-storage')) {
    quota.maxStorageMb = parseFloat(args[args.indexOf('--max-storage') + 1]);
  }

  const useJson = args.includes('--json');

  try {
    const report = await quotaReport(dir, quota);
    if (useJson) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(formatQuotaReport(report, quota));
    }
    if (!report.ok) process.exit(1);
  } catch (err) {
    console.error('Error generating quota report:', err.message);
    process.exit(1);
  }
}

main();
