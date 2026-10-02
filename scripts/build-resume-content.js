#!/usr/bin/env node
/* ============================================================================
   build-resume-content.js
   ----------------------------------------------------------------------------
   Reads resume.md (project root) and writes src/config/resume-content.json.
   Runs automatically before `dev` and `build` (see package.json prebuild2).
   If resume.md is missing, exits 0 without writing anything (config defaults
   are used).
   ========================================================================== */

'use strict';

const fs = require('fs');
const path = require('path');
const { parseMarkdown } = require('./resume-content-lib');

const root = path.resolve(__dirname, '..');
const mdPath = path.join(root, 'resume.md');
const outPath = path.join(root, 'src', 'config', 'resume-content.json');

function main() {
  if (!fs.existsSync(mdPath)) {
    // No markdown file -> nothing to do. config.ts falls back to its defaults.
    if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
    process.exit(0);
  }

  const md = fs.readFileSync(mdPath, 'utf8');
  const content = parseMarkdown(md);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(content, null, 2) + '\n', 'utf8');

  const counts = [];
  for (const [k, v] of Object.entries(content)) {
    if (Array.isArray(v)) counts.push(`${k}:${v.length}`);
    else if (typeof v === 'object' && v !== null && Object.keys(v).length) counts.push(`${k}:✓`);
  }
  console.log(`[content] resume.md -> src/config/resume-content.json (${counts.join(', ')})`);
}

main();
