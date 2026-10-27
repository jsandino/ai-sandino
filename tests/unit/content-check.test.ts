// The guide content rules (docs/guide-format.md#content-rules). Fixtures
// are chapter Markdown, as the check reads it from disk.

import { readdirSync } from 'node:fs';
import { expect, test } from 'vitest';
import {
  checkChapter,
  checkGuide,
  colourNames,
} from '../../scripts/pdf/content-check.mjs';

const NAMES = ['sky', 'neutral'];
const fence = '```';
const mermaid = (...lines: string[]) =>
  [`${fence}mermaid`, 'flowchart LR', ...lines, fence].join('\n');
const lines = (text: string) =>
  checkChapter(text, NAMES).map((p: { line: number }) => p.line);

test('colour names are read from diagram-classes.mmd', () => {
  expect(colourNames()).toEqual([
    'sky',
    'violet',
    'emerald',
    'coral',
    'amber',
    'neutral',
  ]);
});

test('a raw LaTeX block is rejected', () => {
  expect(lines(`# T\n\n${fence}{=latex}\n\\vfill\n${fence}\n`)).toEqual([3]);
});

test('an inline raw LaTeX span is rejected', () => {
  expect(lines('A `\\newline`{=tex} here.')).toEqual([1]);
});

test('LaTeX shown inside another code block is allowed', () => {
  expect(lines(`${fence}markdown\n${fence}{=latex}\n${fence}`)).toEqual([]);
});

test('style, linkStyle, classDef and init directives are rejected', () => {
  const text = mermaid(
    '    style A fill:#fff',
    '    linkStyle 0 stroke:#f00',
    '    classDef x fill:#fff',
    "    %%{init: {'theme': 'dark'}}%%",
  );
  expect(lines(text)).toEqual([3, 4, 5, 6]);
});

test('known colour names are allowed, unknown ones rejected', () => {
  const text = mermaid(
    '    A --> B:::sky',
    '    class A neutral',
    '    class B skye',
    '    C:::violet',
  );
  expect(lines(text)).toEqual([5, 6]);
});

test('"style" outside a diagram is just prose', () => {
  expect(lines('style A fill:#fff is how not to do it.')).toEqual([]);
});

test('every guide in src/content passes', () => {
  const guides = readdirSync('src/content', { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => `src/content/${d.name}`);
  for (const guide of guides) expect(checkGuide(guide)).toEqual([]);
});
