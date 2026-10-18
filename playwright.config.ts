// Playwright: end-to-end test layer (docs/decisions/0013-test-layers.md).
// Tests run against `astro preview` serving the built dist/, so the site
// must be built first. Setup: research/0006-test-layers.md.

import { defineConfig, devices } from '@playwright/test';

const CI = !!process.env.CI;
const PORT = 4321;

export default defineConfig({
  testDir: 'tests/e2e',
  forbidOnly: CI,
  retries: CI ? 2 : 0,
  workers: CI ? 1 : undefined,
  reporter: CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: `http://localhost:${PORT}`, trace: 'on-first-retry' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `node_modules/.bin/astro preview --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !CI,
    timeout: 60_000,
  },
});
