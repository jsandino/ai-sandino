// The `diagram-colours` package for TikZ figures
// (docs/guide-format.md#figures).

import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import {
  colourPackage,
  hex6,
  parseClasses,
} from '../../scripts/pdf/figure-colours.mjs';

const CLASSES = `    classDef sky fill:#e8f0ff,stroke:#36c,color:#000000
    classDef amber fill:#fff4e8,stroke:#c63,color:#000000
`;

test('a short hex colour is expanded to six upper-case digits', () => {
  expect(hex6('36c')).toBe('3366CC');
  expect(hex6('e8f0ff')).toBe('E8F0FF');
});

test('a colour that is not 3 or 6 digits is rejected', () => {
  expect(() => hex6('36cc')).toThrow('bad colour');
});

test('each classDef gives a name with its fill and stroke', () => {
  expect(parseClasses(CLASSES)).toEqual([
    { name: 'sky', fill: 'E8F0FF', stroke: '3366CC' },
    { name: 'amber', fill: 'FFF4E8', stroke: 'CC6633' },
  ]);
});

test('the package defines the stroke as the name and the fill as name + fill', () => {
  const pkg = colourPackage(CLASSES);
  expect(pkg).toContain('\\ProvidesPackage{diagram-colours}');
  expect(pkg).toContain('\\definecolor{sky}{HTML}{3366CC}');
  expect(pkg).toContain('\\definecolor{skyfill}{HTML}{E8F0FF}');
  expect(pkg).toContain('\\definecolor{amber}{HTML}{CC6633}');
});

test('a file with no classDef lines is an error, not an empty package', () => {
  expect(() => colourPackage('flowchart TD')).toThrow('no classDef');
});

test('the real palette defines the six names the guide format lists', () => {
  const names = parseClasses(
    readFileSync('scripts/pdf/diagram-classes.mmd', 'utf8'),
  ).map((c) => c.name);
  expect(names).toEqual([
    'sky',
    'violet',
    'emerald',
    'coral',
    'amber',
    'neutral',
  ]);
});
