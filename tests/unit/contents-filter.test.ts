// Which headings the PDF's contents lists (docs/briefs/pdf-pipeline.md,
// piece 8). Fixtures are pandoc JSON blocks, as the filter receives them.

import { expect, test } from 'vitest';
import { markHeadings } from '../../scripts/pdf/contents-filter.mjs';

type Block = { t: string; c: unknown };

function heading(level: number, text: string, classes: string[] = []): Block {
  const inlines = text
    .split(' ')
    .flatMap((word, i) => [
      ...(i > 0 ? [{ t: 'Space' }] : []),
      { t: 'Str', c: word },
    ]);
  return { t: 'Header', c: [level, ['', classes, []], inlines] };
}

const contents: Block = { t: 'RawBlock', c: ['latex', '\\tableofcontents'] };

function classesOf(block: Block): string[] {
  return (block.c as [number, [string, string[]]])[1][1];
}

function marked(blocks: Block[]): string[][] {
  return markHeadings(blocks)
    .filter((b: Block) => b.t === 'Header')
    .map(classesOf);
}

const UNLISTED = ['unnumbered', 'unlisted'];

test('headings before the contents are unlisted, whatever their level', () => {
  const blocks = [heading(1, 'Intro'), heading(2, '1. Numbered'), contents];
  expect(marked(blocks)).toEqual([UNLISTED, UNLISTED]);
});

test('a # heading after the contents is listed', () => {
  expect(marked([contents, heading(1, 'Part I — Foundations')])).toEqual([[]]);
});

test('a ## heading numbered "3." after the contents is listed', () => {
  expect(marked([contents, heading(2, '3. The four primitives')])).toEqual([
    [],
  ]);
});

test('## headings numbered like A.2, or not numbered, are unlisted', () => {
  const blocks = [
    contents,
    heading(2, 'B.2 Templates'),
    heading(2, "What's next"),
  ];
  expect(marked(blocks)).toEqual([UNLISTED, UNLISTED]);
});

test('### and deeper headings are unlisted, even when numbered', () => {
  const blocks = [contents, heading(3, '3. Deep'), heading(4, 'Deeper')];
  expect(marked(blocks)).toEqual([UNLISTED, UNLISTED]);
});

test('existing classes are kept, and not duplicated', () => {
  const blocks = [
    contents,
    heading(2, 'Aside', ['note', 'unnumbered']),
    heading(1, 'Kept', ['x']),
  ];
  expect(marked(blocks)).toEqual([['note', 'unnumbered', 'unlisted'], ['x']]);
});

test('without a contents block, every heading is unlisted', () => {
  expect(marked([heading(1, 'Only')])).toEqual([UNLISTED]);
});
