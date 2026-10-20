// Static rules for the shared shell (docs/briefs/shell.md, criteria 1 and 4):
// colour tokens live only in global.css, and there is no React (ADR 0003).

import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { expect, test } from 'vitest';

const ROOT = join(import.meta.dirname, '../..');
const SRC = join(ROOT, 'src');
const TOKENS_FILE = 'src/styles/global.css';
// Guide source is print-only Markdown, never site code.
const SKIP_DIRS = new Set(['src/content']);
const CODE_EXTENSIONS = /\.(astro|ts|tsx|js|mjs|css|svg|html)$/;

// Hex colours (#abc, #abcd, #aabbcc, #aabbccdd) and CSS colour functions.
// The lookbehind skips URL fragments such as href="/#faded".
const COLOUR_LITERAL =
  /(?<![\w/&"'])#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/gi;

function codeFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    const rel = relative(ROOT, path);
    if (entry.isDirectory()) return SKIP_DIRS.has(rel) ? [] : codeFiles(path);
    return CODE_EXTENSIONS.test(entry.name) ? [rel] : [];
  });
}

test('colour literals appear only in the token file', () => {
  const hits = codeFiles(SRC)
    .filter((file) => file !== TOKENS_FILE)
    .flatMap((file) =>
      readFileSync(join(ROOT, file), 'utf8')
        .split('\n')
        .flatMap((line, i) =>
          [...line.matchAll(COLOUR_LITERAL)].map(
            (m) => `${file}:${i + 1}  ${m[0]}`,
          ),
        ),
    );

  expect(
    hits,
    `COLOUR LITERAL OUTSIDE ${TOKENS_FILE}
  Rule: every colour is a design token, defined once in ${TOKENS_FILE}
        (docs/design-system.md#colour-tokens), so both themes stay in sync.
  Fix:  replace each literal below with a token utility (bg-surface,
        text-accent-text, ...) or var(--color-<token>). If no token fits,
        the design system needs one first: add it there and in ${TOKENS_FILE}.
${hits.join('\n')}`,
  ).toEqual([]);
});

test('no React in package.json (ADR 0003)', () => {
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  const names = Object.keys({
    ...pkg.dependencies,
    ...pkg.devDependencies,
    ...pkg.peerDependencies,
    ...pkg.optionalDependencies,
  });
  const react = names.filter((n) => /react/i.test(n));
  expect(
    react,
    `REACT DEPENDENCY: ${react.join(', ')}
  Rule: the site uses vanilla Motion in Astro components, never React
        (docs/decisions/0003-vanilla-motion-no-react.md).
  Fix:  remove it with make uninstall PKG=<name> and rewrite the component
        as an Astro component with a small <script>.`,
  ).toEqual([]);
});
