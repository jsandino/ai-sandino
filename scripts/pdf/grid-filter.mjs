#!/usr/bin/env node
//
// grid-filter.mjs — pandoc JSON filter for the `::: grid` block
// (docs/guide-format.md#named-blocks). Run by scripts/build-pdf.sh with
// pandoc's --filter.
//
// A table inside a `::: grid` div is drawn with a full grid of rules, a
// shaded header row and padded cells. Pandoc's own table output has no hook
// for vertical rules or row colours, so in LaTeX output this filter writes
// the table itself, asking pandoc to convert each cell's contents. The
// packages and colours it needs are printed by `grid-filter.mjs --preamble`;
// build-pdf.sh passes them to pandoc as a header file only for a guide that
// has a grid, so other guides' output is unchanged. (The filter cannot add
// them itself: pandoc's --include-in-header replaces any header-includes a
// filter sets.) In any other format the div is dropped and its children kept
// unchanged.
//
// The colours are design tokens from the light theme (the PDF is printed on
// white), read from src/styles/global.css, the one place tokens are defined
// (docs/design-system.md#colour-tokens).

import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const GLOBAL_CSS = fileURLToPath(
  new URL('../../src/styles/global.css', import.meta.url),
);

// The LaTeX colour each grid part uses, and the design token it comes from.
export const GRID_TOKENS = { gridhead: 'bg-alt', gridrule: 'border-strong' };

// Separates cells when they are converted in one pandoc call.
const CELL_MARK = '%%GRIDCELL%%';

const ALIGN = { AlignLeft: 'l', AlignRight: 'r', AlignCenter: 'c' };

/**
 * The light theme's value for each token in `names`, as hex without the
 * `#`, read from global.css. Throws if the light theme or a token is
 * missing, or a value is not a #rrggbb hex colour.
 */
export function lightTokens(css, names) {
  const block = css.match(/:root\[data-theme='light'\]\s*\{([^}]*)\}/);
  if (!block) throw new Error('grid-filter: no light theme in global.css');
  return Object.fromEntries(
    names.map((name) => {
      const value = block[1].match(
        new RegExp(`--color-${name}:\\s*#([0-9a-fA-F]{6})\\s*;`),
      );
      if (!value) {
        throw new Error(
          `grid-filter: no #rrggbb light value for --color-${name} in global.css`,
        );
      }
      return [name, value[1].toUpperCase()];
    }),
  );
}

/** The LaTeX preamble for grid tables, with colours from the tokens. */
export function preamble(css) {
  const values = lightTokens(css, Object.values(GRID_TOKENS));
  return [
    '\\usepackage{longtable}',
    '\\usepackage{array}',
    '\\usepackage{colortbl}',
    ...Object.entries(GRID_TOKENS).map(
      ([colour, token]) => `\\definecolor{${colour}}{HTML}{${values[token]}}`,
    ),
  ].join('\n');
}

/** True for a div with the class `grid`. */
export function isGrid(block) {
  return block.t === 'Div' && block.c[0][1].includes('grid');
}

/** The LaTeX column type for a pandoc colspec: [alignment, width]. */
export function columnType([align, width]) {
  if (width.t === 'ColWidth') {
    return `p{\\dimexpr ${width.c}\\linewidth-2\\tabcolsep\\relax}`;
  }
  return ALIGN[align.t] ?? 'l';
}

/** The rows of a table, as lists of cell blocks: [headRows, bodyRows]. */
export function tableRows(table) {
  const [, , , head, bodies, foot] = table.c;
  const cells = (row) => row[1].map((cell) => cell[4]);
  const headRows = head[1].map(cells);
  const bodyRows = [
    ...bodies.flatMap(([, , inner, rows]) => [...inner, ...rows]),
    ...foot[1],
  ].map(cells);
  return [headRows, bodyRows];
}

/**
 * The LaTeX for a grid table. `render` turns a list of cells (each a list
 * of pandoc blocks) into a list of LaTeX strings, one per cell.
 */
export function gridTable(table, render) {
  const colspecs = table.c[2];
  const [headRows, bodyRows] = tableRows(table);
  const texts = render([...headRows, ...bodyRows].flat());
  let next = 0;
  const line = (row) =>
    row.map(() => texts[next++]).join(' & ') + ' \\\\\n\\hline';
  const spec = '|' + colspecs.map(columnType).join('|') + '|';
  return [
    '\\begingroup',
    '\\setlength{\\tabcolsep}{8pt}\\renewcommand{\\arraystretch}{1.6}',
    '\\arrayrulecolor{gridrule}',
    `\\begin{longtable}{${spec}}`,
    '\\hline',
    ...headRows.map((row) => '\\rowcolor{gridhead}' + line(row)),
    '\\endhead',
    ...bodyRows.map(line),
    '\\end{longtable}',
    '\\endgroup',
  ].join('\n');
}

/** Converts cells to LaTeX with one pandoc call. */
export function pandocRender(apiVersion) {
  return (cells) => {
    if (cells.length === 0) return [];
    const mark = { t: 'RawBlock', c: ['latex', CELL_MARK] };
    const blocks = cells.flatMap((cell, i) => (i > 0 ? [mark, ...cell] : cell));
    const doc = { 'pandoc-api-version': apiVersion, meta: {}, blocks };
    const out = spawnSync('pandoc', ['--from=json', '--to=latex'], {
      input: JSON.stringify(doc),
      encoding: 'utf8',
    });
    if (out.status !== 0) {
      throw new Error(`grid-filter: pandoc failed: ${out.stderr}`);
    }
    return out.stdout.split(CELL_MARK).map((text) => text.trim());
  };
}

/**
 * Replaces every grid div, at any depth: for LaTeX, its tables become grid
 * tables; for other formats, the div is unwrapped. Returns the new blocks
 * and whether any grid was found.
 */
export function expandGrids(blocks, format, render) {
  let found = false;
  const walk = (list) =>
    list.flatMap((block) => {
      if (block.t !== 'Div') return [block];
      const [attr, children] = block.c;
      const inner = walk(children);
      if (!isGrid(block)) return [{ ...block, c: [attr, inner] }];
      found = true;
      if (format !== 'latex') return inner;
      return inner.map((child) =>
        child.t === 'Table'
          ? { t: 'RawBlock', c: ['latex', gridTable(child, render)] }
          : child,
      );
    });
  return { blocks: walk(blocks), found };
}

async function main() {
  if (process.argv[2] === '--preamble') {
    process.stdout.write(preamble(readFileSync(GLOBAL_CSS, 'utf8')) + '\n');
    return;
  }
  let input = '';
  for await (const chunk of process.stdin) input += chunk;
  const doc = JSON.parse(input);
  const format = process.argv[2];
  const { blocks } = expandGrids(
    doc.blocks,
    format,
    pandocRender(doc['pandoc-api-version']),
  );
  doc.blocks = blocks;
  process.stdout.write(JSON.stringify(doc));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
