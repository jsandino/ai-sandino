// Vitest: unit test layer (docs/decisions/0013-test-layers.md).
// getViteConfig loads astro.config.mjs, so tests see the same Vite plugins
// as the site. Setup: research/0006-test-layers.md.

/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    // Scoped so Vitest never picks up the Playwright specs in tests/e2e/.
    include: ['tests/unit/**/*.test.ts'],
  },
});
