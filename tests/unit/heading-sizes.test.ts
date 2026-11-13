// The size of each ## heading in the PDF. Fixtures are pandoc JSON blocks, as
// the filter receives them.

import { expect, test } from 'vitest';
import { sizeHeadings } from '../../scripts/pdf/heading-sizes.mjs';

type Block = { t: string; c: unknown };

function heading(level: number, text: string): Block {
  const inlines = text
    .split(' ')
    .flatMap((word, i) => [
      ...(i > 0 ? [{ t: 'Space' }] : []),
      { t: 'Str', c: word },
    ]);
  return { t: 'Header', c: [level, ['', [], []], inlines] };
}

/** The \fontsize line the filter put before a heading, e.g. "14}{17". */
function sizeBefore(text: string, level = 2): string | undefined {
  const [set] = sizeHeadings([heading(level, text)]);
  const raw = (set as Block).c as string[];
  return set.t === 'RawBlock'
    ? /fontsize\{(\d+)\}\{(\d+)\}/.exec(raw[1])?.slice(1).join('}{')
    : undefined;
}

test('a ## heading numbered "3." is 14pt', () => {
  expect(sizeBefore('3. The four primitives')).toBe('14}{17');
});

test('a ## heading numbered "A.1" is 14pt', () => {
  expect(sizeBefore('A.1 Project layout assumptions')).toBe('14}{17');
});

test('an unnumbered ## heading is 12pt', () => {
  expect(sizeBefore("What's next")).toBe('12}{15');
});

test('the size block goes right before the heading, which is unchanged', () => {
  const h = heading(2, '1. First');
  const out = sizeHeadings([h]);
  expect(out).toHaveLength(2);
  expect(out[0].t).toBe('RawBlock');
  expect(out[1]).toBe(h);
});

test('headings of other levels and other blocks are left alone', () => {
  const blocks = [
    heading(1, 'Part I — Foundations'),
    heading(3, 'Context architecture'),
    { t: 'Para', c: [] },
  ];
  expect(sizeHeadings(blocks)).toEqual(blocks);
});
