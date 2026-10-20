// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Absolute canonical and Open Graph URLs (docs/briefs/shell.md).
  site: 'https://ai.sandino.ca',
  vite: {
    plugins: [tailwindcss()],
  },
});
