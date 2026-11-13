#!/usr/bin/env node
//
// table-widths.mjs — pandoc JSON filter that gives wide tables column
// widths, so their text wraps inside the page. Run by scripts/build-pdf.sh
// with pandoc's --filter.
//
// The guides are read as GitHub-flavoured Markdown, which carries no column
// widths: pandoc then sets every column on one line, and a table with long
// cells runs off the page. A table whose longest cells would not fit on one
// line gets widths in proportion to its columns' longest cells, so it fills
// the text width and wraps. Narrower tables are left alone.

import { pathToFileURL } from 'node:url';

/** Characters in a line of body text; wider tables get widths. */
const LINE = 80;
/** A column's longest cell counts for at least this much, at most MAX. */
const MIN = 8;
const MAX = 60;

/** Length of the text in a pandoc JSON node, links and emphasis included. */
export function textLength(node) {
  if (Array.isArray(node)) return node.reduce((n, x) => n + textLength(x), 0);
  if (node === null || typeof node !== 'object') return 0;
  switch (node.t) {
    case 'Str':
      return node.c.length;
    case 'Code':
      return node.c[1].length;
    case 'Space':
    case 'SoftBreak':
      return 1;
    default:
      return textLength(node.c);
  }
}

/** The longest cell in each column, header and body rows together. */
export function longestCells(table) {
  const [, , colspecs, head, bodies, foot] = table.c;
  const longest = colspecs.map(() => 0);
  const rows = [
    ...head[1],
    ...bodies.flatMap((body) => [...body[2], ...body[3]]),
    ...foot[1],
  ];
  for (const [, cells] of rows) {
    cells.forEach((cell, i) => {
      longest[i] = Math.max(longest[i] ?? 0, textLength(cell[4]));
    });
  }
  return longest;
}

/** Sets column widths on a table whose cells would not fit on one line. */
export function widenTable(table) {
  const longest = longestCells(table);
  if (longest.reduce((a, b) => a + b, 0) <= LINE) return table;
  const weights = longest.map((n) => Math.min(MAX, Math.max(MIN, n)));
  const total = weights.reduce((a, b) => a + b, 0);
  table.c[2].forEach((colspec, i) => {
    colspec[1] = { t: 'ColWidth', c: weights[i] / total };
  });
  return table;
}

/** Widens every table found anywhere in the blocks; returns the blocks. */
export function widenTables(node) {
  if (Array.isArray(node)) {
    node.forEach(widenTables);
  } else if (node !== null && typeof node === 'object') {
    if (node.t === 'Table') widenTable(node);
    widenTables(node.c);
  }
  return node;
}

async function main() {
  let input = '';
  for await (const chunk of process.stdin) input += chunk;
  const doc = JSON.parse(input);
  widenTables(doc.blocks);
  process.stdout.write(JSON.stringify(doc));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
