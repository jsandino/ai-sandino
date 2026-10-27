#!/usr/bin/env node
//
// content-check.mjs — checks a guide's chapters against the content rules
// (docs/guide-format.md#content-rules, ADR 0016). Run by build-pdf.sh,
// precommit-build-pdf.sh and check-pdf-fresh.sh.
//
// Usage: content-check.mjs <guide-folder>
//
// Rules:
//   - no raw LaTeX: no {=latex} or {=tex} block or inline span;
//   - diagrams don't style themselves: no style, linkStyle or classDef
//     statement and no %%{init}%% directive in a Mermaid block;
//   - a diagram's colour names (class A sky, A:::sky) are the ones
//     scripts/pdf/diagram-classes.mmd defines.

import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT_DIR = fileURLToPath(new URL('../..', import.meta.url));
const CLASSES_FILE = join(ROOT_DIR, 'scripts/pdf/diagram-classes.mmd');

const FENCE = /^\s*(`{3,}|~{3,})\s*(.*)$/;
const RAW = /^\{=(latex|tex)\}$/;
const INLINE_RAW = /`[^`]*`\{=(latex|tex)\}/;
const STYLING = /^\s*(style|linkStyle|classDef)\b|^\s*%%\{\s*init/;
const CLASS_STATEMENT = /^\s*class\s+\S+\s+(\S+)\s*$/;
const CLASS_SHORTHAND = /:::(\w+)/g;

/** The colour names diagram-classes.mmd defines. */
export function colourNames(classes = readFileSync(CLASSES_FILE, 'utf8')) {
  return [...classes.matchAll(/^\s*classDef\s+(\w+)/gm)].map((m) => m[1]);
}

/** Problems in one chapter's text, as { line, rule, found, fix }. */
export function checkChapter(text, names = colourNames()) {
  const problems = [];
  const report = (line, rule, found, fix) =>
    problems.push({ line, rule, found, fix });
  const nameList = names.join(', ');
  let fence = null; // { marker, info } while inside a fenced block

  text.split('\n').forEach((content, i) => {
    const line = i + 1;
    const match = content.match(FENCE);
    if (fence) {
      const closes =
        match &&
        match[2] === '' &&
        match[1][0] === fence.marker[0] &&
        match[1].length >= fence.marker.length;
      if (closes) {
        fence = null;
        return;
      }
      if (fence.info !== 'mermaid') return;
      if (STYLING.test(content)) {
        report(
          line,
          'diagrams colour nodes by name, never by value.',
          content.trim(),
          `delete the line and colour nodes with "class <node> <name>" (${nameList}); see docs/guide-format.md#diagram-colours.`,
        );
      }
      const used = [
        content.match(CLASS_STATEMENT)?.[1],
        ...[...content.matchAll(CLASS_SHORTHAND)].map((m) => m[1]),
      ].filter(Boolean);
      for (const name of used) {
        if (names.includes(name)) continue;
        report(
          line,
          'a diagram colour is one of the names the pipeline defines.',
          `"${name}" in: ${content.trim()}`,
          `use one of ${nameList}; see docs/guide-format.md#diagram-colours.`,
        );
      }
      return;
    }
    if (match) {
      fence = { marker: match[1], info: match[2].trim() };
      if (RAW.test(fence.info)) {
        report(
          line,
          'guide content has no raw LaTeX.',
          content.trim(),
          'use a named block (e.g. ::: spread) or plain Markdown; see docs/guide-format.md#named-blocks.',
        );
      }
      return;
    }
    if (INLINE_RAW.test(content)) {
      report(
        line,
        'guide content has no raw LaTeX.',
        content.trim(),
        'write it as plain Markdown; see docs/guide-format.md#content-rules.',
      );
    }
  });
  return problems;
}

/** Checks every chapter of a guide folder; returns the error messages. */
export function checkGuide(dir) {
  const names = colourNames();
  const chapters = readdirSync(dir)
    .filter((f) => /^\d\d-.*\.md$/.test(f))
    .sort();
  return chapters.flatMap((file) => {
    const path = relative(ROOT_DIR, join(dir, file));
    return checkChapter(readFileSync(join(dir, file), 'utf8'), names).map(
      (p) =>
        `GUIDE CHECK: ${path}:${p.line}\n  Rule:  ${p.rule}\n  Found: ${p.found}\n  Fix:   ${p.fix}`,
    );
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const errors = checkGuide(process.argv[2]);
  for (const error of errors) console.error(error);
  process.exit(errors.length > 0 ? 1 : 0);
}
