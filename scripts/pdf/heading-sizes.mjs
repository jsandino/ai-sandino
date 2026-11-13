#!/usr/bin/env node
//
// heading-sizes.mjs — pandoc JSON filter that sets the size of each
// second-level heading in the PDF (read by style-header.tex). Run by
// scripts/build-pdf.sh with pandoc's --filter.
//
// Numbered headings ("1. ...", "A.1 ...") are 14pt; the rest ("What's
// next", "Context", ...) are 12pt. The filter puts a raw LaTeX block before
// each one that sets \subsecfont for the heading that follows.

import { pathToFileURL } from 'node:url';

const NUMBERED = /^(\d+\.|[A-Z]\.\d+)$/;
const NUMBERED_SIZE = [14, 17];
const PLAIN_SIZE = [12, 15];

/** Whether a heading's first word is a number: "3." or "A.1". */
export function isNumbered(inlines) {
  const first = inlines[0];
  return first?.t === 'Str' && NUMBERED.test(first.c);
}

/** Puts a size-setting LaTeX block before every ## heading. */
export function sizeHeadings(blocks) {
  return blocks.flatMap((block) => {
    if (block.t !== 'Header' || block.c[0] !== 2) return [block];
    const [size, leading] = isNumbered(block.c[2]) ? NUMBERED_SIZE : PLAIN_SIZE;
    const set = {
      t: 'RawBlock',
      c: [
        'latex',
        `\\def\\subsecfont{\\fontsize{${size}}{${leading}}\\selectfont}`,
      ],
    };
    return [set, block];
  });
}

async function main() {
  let input = '';
  for await (const chunk of process.stdin) input += chunk;
  const doc = JSON.parse(input);
  doc.blocks = sizeHeadings(doc.blocks);
  process.stdout.write(JSON.stringify(doc));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
