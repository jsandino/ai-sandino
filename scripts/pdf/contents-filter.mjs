#!/usr/bin/env node
//
// contents-filter.mjs — pandoc JSON filter that decides which headings the
// PDF's contents lists (docs/guide-format.md#contents). Run by
// scripts/build-pdf.sh with pandoc's --filter.
//
// The pipeline puts a raw LaTeX \tableofcontents block after the first
// chapter. Every heading the contents must not list gets the classes
// `unnumbered` and `unlisted` (pandoc only honours `unlisted` together with
// `unnumbered`). Listed: each `#` heading after the contents, and each `##`
// heading after it whose first word is a number and a full stop ("3.").

import { pathToFileURL } from 'node:url';

const UNLISTED = ['unnumbered', 'unlisted'];
const SECTION_NUMBER = /^\d+\.$/;

/** True for the raw LaTeX block that holds \tableofcontents. */
export function isContents(block) {
  return (
    block.t === 'RawBlock' &&
    ['latex', 'tex'].includes(block.c[0]) &&
    block.c[1].includes('\\tableofcontents')
  );
}

/** Whether a heading (level, inlines) after the contents is listed. */
export function isListed(level, inlines) {
  if (level === 1) return true;
  if (level !== 2) return false;
  const first = inlines[0];
  return first?.t === 'Str' && SECTION_NUMBER.test(first.c);
}

/** Marks every heading the contents must not list; returns the blocks. */
export function markHeadings(blocks) {
  let afterContents = false;
  for (const block of blocks) {
    if (isContents(block)) afterContents = true;
    if (block.t !== 'Header') continue;
    const [level, [, classes], inlines] = block.c;
    if (afterContents && isListed(level, inlines)) continue;
    for (const name of UNLISTED) {
      if (!classes.includes(name)) classes.push(name);
    }
  }
  return blocks;
}

async function main() {
  let input = '';
  for await (const chunk of process.stdin) input += chunk;
  const doc = JSON.parse(input);
  markHeadings(doc.blocks);
  process.stdout.write(JSON.stringify(doc));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
