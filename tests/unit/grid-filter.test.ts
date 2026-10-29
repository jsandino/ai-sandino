// The `::: grid` block (docs/guide-format.md#named-blocks). Fixtures are
// pandoc JSON blocks, as the filter receives them. Cells are rendered by a
// stub here; the real filter asks pandoc.

import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import {
  addPreamble,
  columnType,
  expandGrids,
  lightTokens,
  preamble,
} from '../../scripts/pdf/grid-filter.mjs';

type Block = { t: string; c: unknown };

const attr = ['', [], []];
const plain = (text: string): Block => ({
  t: 'Plain',
  c: [{ t: 'Str', c: text }],
});
const para = (text: string): Block => ({
  t: 'Para',
  c: [{ t: 'Str', c: text }],
});
const cell = (text: string) => [
  attr,
  { t: 'AlignDefault' },
  1,
  1,
  [plain(text)],
];
const row = (...texts: string[]) => [attr, texts.map(cell)];
const colspec = [{ t: 'AlignDefault' }, { t: 'ColWidthDefault' }];

/** A pandoc table with one header row and the given body rows. */
const table = (head: string[], ...body: string[][]): Block => ({
  t: 'Table',
  c: [
    attr,
    [null, []],
    head.map(() => colspec),
    [attr, [row(...head)]],
    [[attr, 0, [], body.map((r) => row(...r))]],
    [attr, []],
  ],
});
const div = (classes: string[], children: Block[]): Block => ({
  t: 'Div',
  c: [['', classes, []], children],
});

/** Renders each cell as its text, as pandoc would for plain words. */
const stub = (cells: Block[][]) =>
  cells.map((blocks) => (blocks[0].c as { c: string }[])[0].c);

test('for LaTeX, a table in a grid becomes a ruled table with a shaded header', () => {
  const { blocks, found } = expandGrids(
    [div(['grid'], [table(['A', 'B'], ['x', 'y'])])],
    'latex',
    stub,
  );
  expect(found).toBe(true);
  expect(blocks).toHaveLength(1);
  const [format, tex] = blocks[0].c as [string, string];
  expect(format).toBe('latex');
  expect(tex).toContain('\\begin{longtable}{|l|l|}');
  expect(tex).toContain('\\rowcolor{gridhead}A & B \\\\\n\\hline');
  expect(tex).toContain('x & y \\\\\n\\hline');
});

test('a grid keeps its other blocks as they are', () => {
  const { blocks } = expandGrids(
    [div(['grid'], [para('note'), table(['A'], ['x'])])],
    'latex',
    stub,
  );
  expect(blocks[0]).toEqual(para('note'));
  expect(blocks[1].t).toBe('RawBlock');
});

test('a table outside a grid is left as it is', () => {
  const blocks = [table(['A'], ['x']), div(['note'], [table(['B'], ['y'])])];
  const out = expandGrids(blocks, 'latex', stub);
  expect(out.found).toBe(false);
  expect(out.blocks).toEqual(blocks);
});

test('for other formats, a grid is unwrapped and its table kept', () => {
  const t = table(['A'], ['x']);
  const out = expandGrids([div(['grid'], [t])], 'html', stub);
  expect(out.blocks).toEqual([t]);
});

test('column types follow the alignment, or the width when one is set', () => {
  expect(columnType([{ t: 'AlignRight' }, { t: 'ColWidthDefault' }])).toBe('r');
  expect(columnType([{ t: 'AlignDefault' }, { t: 'ColWidthDefault' }])).toBe(
    'l',
  );
  expect(columnType([{ t: 'AlignLeft' }, { t: 'ColWidth', c: 0.25 }])).toBe(
    'p{\\dimexpr 0.25\\linewidth-2\\tabcolsep\\relax}',
  );
});

test('the preamble is appended to any existing header-includes', () => {
  const existing = { t: 'MetaBlocks', c: [] };
  const meta = addPreamble(
    { 'header-includes': existing },
    '\\usepackage{colortbl}',
  );
  const list = meta['header-includes'] as { t: string; c: unknown[] };
  expect(list.t).toBe('MetaList');
  expect(list.c[0]).toEqual(existing);
  expect(JSON.stringify(list.c[1])).toContain('colortbl');
});

const css = `
@theme {
  --color-bg-alt: #1b1b24;
  --color-border-strong: #38383d;
}
:root[data-theme='light'] {
  --color-bg-alt: #f1f1f4;
  --color-border-strong: #cfcfd6;
}`;

test('token values come from the light theme, not the dark default', () => {
  expect(lightTokens(css, ['bg-alt', 'border-strong'])).toEqual({
    'bg-alt': 'F1F1F4',
    'border-strong': 'CFCFD6',
  });
});

test('the preamble defines the grid colours from the tokens', () => {
  const latex = preamble(css);
  expect(latex).toContain('\\definecolor{gridhead}{HTML}{F1F1F4}');
  expect(latex).toContain('\\definecolor{gridrule}{HTML}{CFCFD6}');
});

test('a missing token fails with its name', () => {
  expect(() => lightTokens(css, ['surface'])).toThrow('--color-surface');
});

test('the tokens the grid uses exist in the real global.css', () => {
  const real = readFileSync('src/styles/global.css', 'utf8');
  expect(() => preamble(real)).not.toThrow();
});
