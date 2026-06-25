#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sumsPath = path.join(root, 'SHA256SUMS.txt');
const lines = readFileSync(sumsPath, 'utf8').split(/\r?\n/).filter(Boolean);
let ok = true;

for (const line of lines) {
  const m = line.match(/^([0-9a-fA-F]{64}) \*(.+)$/);
  if (!m) {
    console.error(`BAD-SUM-LINE ${line}`);
    ok = false;
    continue;
  }
  const expected = m[1].toLowerCase();
  const name = m[2];
  const actual = createHash('sha256').update(readFileSync(path.join(root, name))).digest('hex');
  if (actual !== expected) {
    console.error(`MISMATCH ${name} expected=${expected} actual=${actual}`);
    ok = false;
  } else {
    console.log(`OK ${name} ${actual}`);
  }
}

if (!ok) process.exit(1);
console.log('SHA256SUMS PASS');

