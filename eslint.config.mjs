// ESLint: linting layer L1 (docs/development.md#enforcement-layers).
// Setup: research/0004-lint-format-typecheck.md.

import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores([
    'dist/',
    'build/',
    '.astro/',
    '.lighthouseci/',
    'test-results/',
    'playwright-report/',
    'src/content/harness-guide/',
  ]),
  js.configs.recommended,
  tseslint.configs.recommended,
  astro.configs.recommended,
  // Plain JS files here are config and tooling run by Node, never the browser.
  { files: ['**/*.{js,mjs,cjs}'], languageOptions: { globals: globals.node } },
]);
