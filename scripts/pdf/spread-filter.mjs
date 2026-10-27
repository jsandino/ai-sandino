#!/usr/bin/env node
//
// spread-filter.mjs — pandoc JSON filter for the `::: spread` block
// (docs/guide-format.md#named-blocks). Run by scripts/build-pdf.sh with
// pandoc's --filter.
//
// A `::: spread` div spaces its blocks evenly down the rest of the page: in
// LaTeX output its children are kept and a raw `\vfill` goes between each
// pair. In any other format the div is dropped and its children kept, so
// the blocks simply follow one another.

import { pathToFileURL } from 'node:url';

const VFILL = { t: 'RawBlock', c: ['latex', '\\vfill'] };

/** True for a div with the class `spread`. */
export function isSpread(block) {
  return block.t === 'Div' && block.c[0][1].includes('spread');
}

/** The blocks of a spread div, with a \vfill between each pair for LaTeX. */
export function spreadBlocks(children, format) {
  if (format !== 'latex') return children;
  return children.flatMap((child, i) => (i > 0 ? [VFILL, child] : [child]));
}

/** Replaces every spread div, at any depth, with its spread blocks. */
export function expandSpreads(blocks, format) {
  return blocks.flatMap((block) => {
    if (block.t === 'Div') {
      const [attr, children] = block.c;
      const inner = expandSpreads(children, format);
      if (isSpread(block)) return spreadBlocks(inner, format);
      return [{ ...block, c: [attr, inner] }];
    }
    return [block];
  });
}

async function main() {
  let input = '';
  for await (const chunk of process.stdin) input += chunk;
  const doc = JSON.parse(input);
  doc.blocks = expandSpreads(doc.blocks, process.argv[2]);
  process.stdout.write(JSON.stringify(doc));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
