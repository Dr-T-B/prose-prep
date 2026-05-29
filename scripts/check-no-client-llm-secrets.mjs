#!/usr/bin/env node
// Fails if browser-shipped source (or package.json) contains forbidden
// client-side LLM-key patterns. Intentionally narrow: scans `src/` and
// `package.json` only. Audit notes under `docs/` and server-side edge
// functions are out of scope for this check.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));

const FORBIDDEN = [
  { pattern: /GEMINI_API_KEY/, label: 'GEMINI_API_KEY (with or without VITE_ prefix)' },
  { pattern: /GoogleGenAI/, label: 'GoogleGenAI symbol' },
  { pattern: /@google\/genai/, label: '@google/genai import' },
  { pattern: /new\s+GoogleGenAI/, label: 'new GoogleGenAI(' },
  { pattern: /import\.meta\.env\.VITE_GEMINI/, label: 'import.meta.env.VITE_GEMINI*' },
  { pattern: /process\.env\.GEMINI/, label: 'process.env.GEMINI*' },
  { pattern: /OPENAI_API_KEY/, label: 'OPENAI_API_KEY in browser source' },
  { pattern: /import\.meta\.env\.VITE_OPENAI/, label: 'import.meta.env.VITE_OPENAI*' },
  { pattern: /process\.env\.OPENAI/, label: 'process.env.OPENAI* in browser source' },
  { pattern: /from\s+['"]openai['"]/, label: 'openai package import' },
  { pattern: /new\s+OpenAI\s*\(/, label: 'new OpenAI(' },
  { pattern: /api\.openai\.com/, label: 'OpenAI API host' },
];

const SCAN_TARGETS = [
  { path: 'src', kind: 'dir' },
  { path: 'package.json', kind: 'file' },
];

const SKIP_FILES = new Set([
  // The scanner script itself contains the forbidden patterns by design.
  'scripts/check-no-client-llm-secrets.mjs',
]);

const TEXT_EXT = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json', '.md',
]);

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry.startsWith('.')) continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      out.push(...walk(full));
    } else if (stat.isFile()) {
      const dot = entry.lastIndexOf('.');
      if (dot === -1 || TEXT_EXT.has(entry.slice(dot))) out.push(full);
    }
  }
  return out;
}

function collectFiles() {
  const files = [];
  for (const target of SCAN_TARGETS) {
    const abs = join(repoRoot, target.path);
    try {
      if (target.kind === 'dir') files.push(...walk(abs));
      else files.push(abs);
    } catch {
      // Missing target is fine — nothing to scan.
    }
  }
  return files;
}

function scan() {
  const hits = [];
  for (const file of collectFiles()) {
    const rel = relative(repoRoot, file);
    if (SKIP_FILES.has(rel)) continue;
    const contents = readFileSync(file, 'utf8');
    const lines = contents.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const rule of FORBIDDEN) {
        if (rule.pattern.test(line)) {
          hits.push({ file: rel, line: i + 1, label: rule.label, text: line.trim() });
        }
      }
    }
  }
  return hits;
}

const hits = scan();
if (hits.length > 0) {
  console.error('Forbidden client-side LLM patterns detected:\n');
  for (const h of hits) {
    console.error(`  ${h.file}:${h.line}  [${h.label}]  ${h.text}`);
  }
  console.error(`\n${hits.length} violation(s). Move LLM calls server-side.`);
  process.exit(1);
}

console.log('check-no-client-llm-secrets: clean.');
