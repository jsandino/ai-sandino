// The `::: spread` block (docs/guide-format.md#named-blocks). Fixtures are
// pandoc JSON blocks, as the filter receives them.

import { expect, test } from 'vitest';
import { expandSpreads } from '../../scripts/pdf/spread-filter.mjs';

type Block = { t: string; c: unknown };

const para = (text: string): Block => ({
  t: 'Para',
  c: [{ t: 'Str', c: text }],
});
const div = (classes: string[], children: Block[]): Block => ({
  t: 'Div',
  c: [['', classes, []], children],
});
const vfill: Block = { t: 'RawBlock', c: ['latex', '\\vfill'] };

test('for LaTeX, a spread puts a \\vfill between each pair of its blocks', () => {
  const blocks = [div(['spread'], [para('a'), para('b'), para('c')])];
  expect(expandSpreads(blocks, 'latex')).toEqual([
    para('a'),
    vfill,
    para('b'),
    vfill,
    para('c'),
  ]);
});

test('blocks outside the spread are left as they are', () => {
  const blocks = [para('before'), div(['spread'], [para('a')]), para('after')];
  expect(expandSpreads(blocks, 'latex')).toEqual([
    para('before'),
    para('a'),
    para('after'),
  ]);
});

test('for other formats, a spread is unwrapped with no spacing', () => {
  const blocks = [div(['spread'], [para('a'), para('b')])];
  expect(expandSpreads(blocks, 'html')).toEqual([para('a'), para('b')]);
});

test('a spread inside another div is expanded; the outer div is kept', () => {
  const blocks = [div(['note'], [div(['spread'], [para('a'), para('b')])])];
  expect(expandSpreads(blocks, 'latex')).toEqual([
    div(['note'], [para('a'), vfill, para('b')]),
  ]);
});
