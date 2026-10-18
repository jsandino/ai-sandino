# 0006 — Unit and end-to-end test layers for a static Astro 7 site

- **Date:** 2026-10-16
- **Status:** Current
- **Question:** How should Vitest (unit, with the Container API) and
  Playwright with axe (end-to-end, against the built `dist/`) be set up for
  an Astro 7 + Tailwind v4 + TypeScript 6 site on Node 24, and how should
  they run in GitHub Actions?

---

**Bottom line:** Use Vitest with `getViteConfig` from `astro/config` for unit tests, including Container API rendering of `src/pages/index.astro`. Use `@playwright/test` against `astro preview` serving the built `dist/` for end-to-end tests, with `@axe-core/playwright` for WCAG checks. No conflicts with Node 24 or TypeScript 6 were found. Playwright officially advises **against** caching browsers in CI: install Chromium (headless shell only) with OS dependencies on every run.

## 1. Vitest for Astro 7

- Versions (npm dist-tags, 2026-10-16):
  - `astro` latest is 7.4.0. It depends on `vite ^8.3.4` and uses `vitest ^4.1.11` itself.
  - `vitest` latest is 5.0.5 (peer `vite ^6.4 || ^7 || ^8`, engines `^22.12 || ^24 || >=26`). The `V4` tag is 4.1.12.
- No Astro docs mention Vitest 5, so `getViteConfig` with Vitest 5 is unverified. If it misbehaves, pin `vitest@^4.1.12`, which matches what Astro itself uses.
- Setup, from the Astro testing guide. `getViteConfig` loads `astro.config`, so Tailwind and other Vite plugins come along:

```ts
// vitest.config.ts
/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';
export default getViteConfig({
  test: { include: ['tests/unit/**/*.test.ts'] },
});
```

- The Container API still ships only as `experimental_AstroContainer` (`astro@7.4.0` `dist/container/index.d.ts`). It may break even in minor or patch releases.
- Rendering a full page:

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Index from '../../src/pages/index.astro';

test('index renders', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Index, { partial: false });
  expect(html).toMatch(/<h1[^>]*>/);
});
```

- Gotchas:
  - `partial` defaults to `true`, which gives no doctype or page shell. Pass `partial: false` for a full document.
  - Vitest does not process CSS by default, so styling belongs in end-to-end tests.
  - Keep Vitest's `include` scoped to `tests/unit/**`, so it never picks up Playwright specs.

## 2. Playwright against a pre-built `dist/`

- `@playwright/test` latest is 1.64.1 and requires Node >=20.

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: 'tests/e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['list']] : 'list',
  use: { baseURL: 'http://localhost:4321', trace: 'on-first-retry' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'astro preview --port 4321',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
```

- `astro preview` serves the existing `dist/`, so the site must be built first.
- `webServer.url` is the current option (`port` is deprecated). The server counts as ready on a 2xx, 3xx, 400, 401, 402 or 403 response.
- Browser install:
  - Headless runs use `chromium-headless-shell`, so with no `channel` set, `--only-shell` skips the full Chromium download.
  - CI on Ubuntu: `playwright install --with-deps --only-shell chromium`.
  - Locally on macOS: `playwright install --only-shell chromium` (cache in `~/Library/Caches/ms-playwright`).

## 3. `@axe-core/playwright` 4.14.0

```ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('home has no a11y violations', async ({ page }, testInfo) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  await testInfo.attach('axe-results', {
    body: JSON.stringify(results, null, 2),
    contentType: 'application/json',
  });
  expect(results.violations).toEqual([]);
});
```

- `toEqual([])` prints each violation's id, nodes and help URL on failure.
- The Playwright docs list the first four tags. `wcag22aa` is an axe-core tag, and unknown tags are harmless.
- Axe catches only a subset of WCAG issues, so a pass does not prove compliance.

## 4. GitHub Actions

- Playwright's CI docs say "Caching browser binaries is not recommended", because restoring the cache takes about as long as downloading. OS dependencies are not cacheable and must be installed on every run.
- Recommended steps:
  - install dependencies;
  - run `playwright install --with-deps --only-shell chromium`;
  - run the tests;
  - upload `playwright-report/` with `if: ${{ !cancelled() }}` (or only on failure).
- To cache anyway: key `~/.cache/ms-playwright` on the Playwright version, and still run `playwright install-deps chromium` on a cache hit.

## 5. Compatibility

- Node 24 is supported by both Vitest 5 and Playwright 1.64.
- TypeScript 6: no stated conflict. Neither package declares a TypeScript peer, and Playwright transpiles TS itself (medium confidence; confirm with `astro check`).
- ESLint: add Node globals for the two config files if `no-undef` fires on `process`.

## 6. Rough run times (estimates, not measured)

- Vitest, one Container render: about 1–3 s.
- Playwright, one page with axe: about 3–6 s.
- CI browser install with `--with-deps --only-shell`: roughly 20–40 s.

## Sources

- <https://docs.astro.build/en/guides/testing/>
- <https://docs.astro.build/en/reference/container-reference/>
- <https://unpkg.com/astro@7.4.0/dist/container/index.d.ts>
- <https://registry.npmjs.org/astro/7.4.0>
- <https://registry.npmjs.org/vitest/latest>
- <https://registry.npmjs.org/@playwright/test/latest>
- <https://registry.npmjs.org/@axe-core/playwright/latest>
- <https://playwright.dev/docs/ci>
- <https://playwright.dev/docs/browsers>
- <https://playwright.dev/docs/test-webserver>
- <https://playwright.dev/docs/accessibility-testing>
