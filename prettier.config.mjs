// Prettier: formatting layer L1 (docs/development.md#enforcement-layers).
// Setup and plugin order: research/0004-lint-format-typecheck.md.

/** @type {import('prettier').Config} */
export default {
  singleQuote: true,
  // The Tailwind plugin must load last.
  plugins: ['prettier-plugin-astro', 'prettier-plugin-tailwindcss'],
  overrides: [{ files: '*.astro', options: { parser: 'astro' } }],
  // Tailwind v4 has no JS config; the plugin reads the CSS entry point.
  tailwindStylesheet: './src/styles/global.css',
};
