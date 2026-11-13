// Column widths for wide tables in the PDF. Fixtures are pandoc JSON tables,
// as the filter receives them.

import { expect, test } from 'vitest';
import { widenTables } from '../../scripts/pdf/table-widths.mjs';

type Cell = unknown;
type Table = { t: 'Table'; c: unknown[] };

function cell(text: string): Cell {
  return [
    ['', [], []],
    { t: 'AlignDefault' },
    1,
    1,
    [{ t: 'Plain', c: [{ t: 'Str', c: text }] }],
  ];
}

function row(...texts: string[]): unknown {
  return [['', [], []], texts.map(cell)];
}

/** A pandoc table: a header row and body rows, every column default-width. */
function table(header: string[], ...rows: string[][]): Table {
  return {
    t: 'Table',
    c: [
      ['', [], []],
      [null, []],
      header.map(() => [{ t: 'AlignDefault' }, { t: 'ColWidthDefault' }]),
      [['', [], []], [row(...header)]],
      [[['', [], []], 0, [], rows.map((r) => row(...r))]],
      [['', [], []], []],
    ],
  };
}

function widths(t: Table): unknown[] {
  return (t.c[2] as [unknown, unknown][]).map(([, w]) => w);
}

const long = 'x'.repeat(50);

test('a table whose cells would not fit on one line gets widths', () => {
  const t = table(['', 'A', 'B'], ['Row', long, long]);
  widenTables([t]);
  const w = widths(t) as { t: string; c: number }[];
  expect(w.every((x) => x.t === 'ColWidth')).toBe(true);
  expect(w.reduce((n, x) => n + x.c, 0)).toBeCloseTo(1);
});

test('wider columns get wider widths', () => {
  const t = table(['A', 'B', 'C'], ['short', long, long]);
  widenTables([t]);
  const [a, b] = widths(t) as { c: number }[];
  expect(b.c).toBeGreaterThan(a.c);
});

test('a narrow table is left alone', () => {
  const t = table(['A', 'B'], ['one', 'two']);
  widenTables([t]);
  expect(widths(t)).toEqual([
    { t: 'ColWidthDefault' },
    { t: 'ColWidthDefault' },
  ]);
});

test('a table nested in other blocks is found', () => {
  const t = table(['A', 'B'], [long, long]);
  widenTables([{ t: 'BulletList', c: [[[t]]] }]);
  expect((widths(t)[0] as { t: string }).t).toBe('ColWidth');
});
