// The `::: relaxed` block (docs/guide-format.md#named-blocks). Fixtures are
// pandoc JSON blocks, as the filter receives them.

import { expect, test } from 'vitest';
import { expandRelaxed } from '../../scripts/pdf/relaxed-filter.mjs';

type Block = { t: string; c: unknown };

const para = (text: string): Block => ({
  t: 'Para',
  c: [{ t: 'Str', c: text }],
});
const div = (classes: string[], children: Block[]): Block => ({
  t: 'Div',
  c: [['', classes, []], children],
});
const isRaw = (block: Block) => block.t === 'RawBlock';

test('for LaTeX, a relaxed block is wrapped in a group that widens the spacing', () => {
  const out = expandRelaxed(
    [div(['relaxed'], [para('a'), para('b')])],
    'latex',
  );
  expect(out).toHaveLength(4);
  const [open, , , close] = out;
  expect(isRaw(open) && isRaw(close)).toBe(true);
  expect(open.c[1]).toMatch(/^\\begingroup\\linespread\{1\.25\}/);
  expect(open.c[1]).toContain('\\renewcommand{\\tightlist}');
  expect(close.c[1]).toBe('\\par\\endgroup');
  expect(out.slice(1, 3)).toEqual([para('a'), para('b')]);
});

test('blocks outside the relaxed block are left as they are', () => {
  const out = expandRelaxed(
    [para('before'), div(['relaxed'], [para('a')]), para('after')],
    'latex',
  );
  expect(out[0]).toEqual(para('before'));
  expect(out[out.length - 1]).toEqual(para('after'));
});

test('without a relaxed block, the blocks are unchanged', () => {
  const blocks = [para('a'), div(['note'], [para('b')])];
  expect(expandRelaxed(blocks, 'latex')).toEqual(blocks);
});

test('for other formats, a relaxed block is unwrapped with no spacing', () => {
  const blocks = [div(['relaxed'], [para('a'), para('b')])];
  expect(expandRelaxed(blocks, 'html')).toEqual([para('a'), para('b')]);
});

test('a relaxed block inside another div is expanded; the outer div is kept', () => {
  const out = expandRelaxed(
    [div(['spread'], [div(['relaxed'], [para('a')])])],
    'latex',
  );
  expect(out).toHaveLength(1);
  expect(out[0].t).toBe('Div');
  const [, children] = out[0].c as [unknown, Block[]];
  expect(children.map((b) => b.t)).toEqual(['RawBlock', 'Para', 'RawBlock']);
});
