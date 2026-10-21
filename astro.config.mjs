// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Absolute canonical and Open Graph URLs (docs/briefs/shell.md).
  site: 'https://ai.sandino.ca',
  // Pages built as <slug>.html and served at /<slug> by Cloudflare Pages, so
  // URLs never carry a trailing slash (docs/decisions/0014).
  trailingSlash: 'never',
  build: { format: 'file' },
  vite: {
    plugins: [tailwindcss()],
  },
});
