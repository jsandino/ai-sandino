#!/usr/bin/env node
//
// figure-colours.mjs — the `diagram-colours` LaTeX package for TikZ figures
// (docs/guide-format.md#figures). Run by scripts/render-diagrams.sh, which
// writes its output to diagram-colours.sty before compiling a guide's
// figures.
//
// The colours come from scripts/pdf/diagram-classes.mmd, the one place the
// print palette is defined. For each colour name there are two LaTeX colours:
// the stroke, under the name itself (`sky`), and the fill (`skyfill`).

import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const CLASSES = fileURLToPath(
  new URL('./diagram-classes.mmd', import.meta.url),
);

// `classDef sky fill:#e8f0ff,stroke:#36c,color:#000000`
const CLASS_DEF =
  /^\s*classDef\s+(\w+)\s+fill:#([0-9a-fA-F]{3,6}),stroke:#([0-9a-fA-F]{3,6})/gm;

/** A CSS hex colour without the `#`, as six upper-case digits ("36c" -> "3366CC"). */
export function hex6(hex) {
  const full =
    hex.length === 3
      ? hex
          .split('')
          .map((c) => c + c)
          .join('')
      : hex;
  if (full.length !== 6) throw new Error(`figure-colours: bad colour #${hex}`);
  return full.toUpperCase();
}

/** The colours defined by classDef lines: [{ name, fill, stroke }]. */
export function parseClasses(text) {
  return [...text.matchAll(CLASS_DEF)].map(([, name, fill, stroke]) => ({
    name,
    fill: hex6(fill),
    stroke: hex6(stroke),
  }));
}

/** The text of the `diagram-colours` package for the given classDef lines. */
export function colourPackage(text) {
  const classes = parseClasses(text);
  if (classes.length === 0) {
    throw new Error('figure-colours: no classDef lines in diagram-classes.mmd');
  }
  return [
    '\\NeedsTeXFormat{LaTeX2e}',
    '\\ProvidesPackage{diagram-colours}[2000/01/01 generated from scripts/pdf/diagram-classes.mmd]',
    '\\RequirePackage{xcolor}',
    ...classes.flatMap(({ name, fill, stroke }) => [
      `\\definecolor{${name}}{HTML}{${stroke}}`,
      `\\definecolor{${name}fill}{HTML}{${fill}}`,
    ]),
    '',
  ].join('\n');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.stdout.write(colourPackage(readFileSync(CLASSES, 'utf8')));
}
