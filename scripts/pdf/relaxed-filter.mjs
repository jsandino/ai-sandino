#!/usr/bin/env node
//
// relaxed-filter.mjs — pandoc JSON filter for the `::: relaxed` block
// (docs/guide-format.md#named-blocks). Run by scripts/build-pdf.sh with
// pandoc's --filter.
//
// A `::: relaxed` div gives its blocks more room: in LaTeX output they are
// set in a group with wider line spacing and space between list items. In
// any other format the div is dropped and its children kept unchanged.

import { pathToFileURL } from 'node:url';

// \tightlist is how pandoc's LaTeX output marks a tight list; redefining it
// inside the group spaces only the lists in the block.
const OPEN = {
  t: 'RawBlock',
  c: [
    'latex',
    '\\begingroup\\linespread{1.25}\\selectfont' +
      '\\renewcommand{\\tightlist}{\\setlength{\\itemsep}{0.4\\baselineskip}' +
      '\\setlength{\\parskip}{0pt}}',
  ],
};
const CLOSE = { t: 'RawBlock', c: ['latex', '\\par\\endgroup'] };

/** True for a div with the class `relaxed`. */
export function isRelaxed(block) {
  return block.t === 'Div' && block.c[0][1].includes('relaxed');
}

/** Replaces every relaxed div, at any depth, with its (grouped) blocks. */
export function expandRelaxed(blocks, format) {
  return blocks.flatMap((block) => {
    if (block.t === 'Div') {
      const [attr, children] = block.c;
      const inner = expandRelaxed(children, format);
      if (!isRelaxed(block)) return [{ ...block, c: [attr, inner] }];
      return format === 'latex' ? [OPEN, ...inner, CLOSE] : inner;
    }
    return [block];
  });
}

async function main() {
  let input = '';
  for await (const chunk of process.stdin) input += chunk;
  const doc = JSON.parse(input);
  doc.blocks = expandRelaxed(doc.blocks, process.argv[2]);
  process.stdout.write(JSON.stringify(doc));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
