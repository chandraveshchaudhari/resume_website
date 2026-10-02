#!/usr/bin/env node
/* ============================================================================
   export-resume-content.js
   ----------------------------------------------------------------------------
   Writes the current merged siteConfig (markdown content + config defaults)
   back out as resume.md. Useful for:
     - migrating an existing config.ts into the markdown format
     - regenerating the template after schema changes
   Usage: node scripts/export-resume-content.js [--out resume.md]
   ========================================================================== */

'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

// Resolve TS config by running tsc's transpile via a tiny esbuild-free trick:
// we require the compiled JSON content + a hand-rolled require hook for TS.
// Simpler: use ts-node if available, else fall back to a regex-free approach —
// instead we transpile with the TypeScript compiler already in node_modules.
function loadSiteConfig() {
  const tsPath = path.join(root, 'src', 'config', 'config.ts');
  const ts = require('typescript');
  const source = fs.readFileSync(tsPath, 'utf8');
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019, esModuleInterop: true },
  }).outputText;

  // Export must serialize the DEFAULT config (config.ts), not the merged one —
  // otherwise markdown content would be re-exported with asset paths already
  // wrapped and round-trips would drift. Temporarily neutralize the JSON import
  // by pointing require at an empty object for resume-content.json.
  const jsonPath = path.join(root, 'src', 'config', 'resume-content.json');
  const backup = fs.existsSync(jsonPath) ? fs.readFileSync(jsonPath, 'utf8') : null;
  fs.writeFileSync(jsonPath, '{}\n', 'utf8');

  try {
    const Module = require('module');
    const m = new Module('siteconfig-virtual', null);
    m.filename = tsPath; // so relative requires (resume-content.json) resolve
    m.paths = Module._nodeModulePaths(root);
    m._compile(js, tsPath);
    return m.exports.default || m.exports;
  } finally {
    if (backup === null) fs.unlinkSync(jsonPath);
    else fs.writeFileSync(jsonPath, backup, 'utf8');
  }
}

function main() {
  const args = process.argv.slice(2);
  const outIdx = args.indexOf('--out');
  const outPath = outIdx >= 0 ? path.resolve(root, args[outIdx + 1]) : path.join(root, 'resume.md');

  const { serializeToMarkdown } = require('./resume-content-lib');
  const cfg = loadSiteConfig();
  const md = serializeToMarkdown(cfg);
  fs.writeFileSync(outPath, md, 'utf8');
  console.log(`[content] exported merged config -> ${path.relative(root, outPath)}`);
}

main();
