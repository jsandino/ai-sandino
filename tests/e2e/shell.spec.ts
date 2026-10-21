// The shared shell on every page (docs/briefs/shell.md, acceptance
// criteria 2 and 4–11), checked against the built site.

import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const SITE = 'https://ai.sandino.ca';
const REPO_URL = 'https://github.com/jsandino/ai-sandino';
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const MISSING = '/this-page-does-not-exist';

// Every page the site builds, with its expected metadata. The 404 page is
// reached through a missing path, as visitors reach it.
const PAGES = [
  {
    path: '/',
    canonicalPath: '/',
    title: 'Practical AI engineering — ai.sandino.ca',
    description:
      'Practical AI engineering, explained through interactive pages, companion PDF guides and working code.',
  },
  {
    path: MISSING,
    // Built as 404.html and served at /404, with no trailing slash
    // (docs/decisions/0014).
    canonicalPath: '/404',
    title: 'Page not found — ai.sandino.ca',
    description: "This page doesn't exist on ai.sandino.ca.",
  },
];

// The bg token for each theme, read from the design system (the source of
// truth) rather than copied here.
function bgToken(): { dark: string; light: string } {
  const doc = readFileSync(
    join(import.meta.dirname, '../../docs/design-system.md'),
    'utf8',
  );
  const row = doc.match(/^\| `bg` \| `(#[0-9a-f]{6})` \| `(#[0-9a-f]{6})` \|/m);
  if (!row) throw new Error('bg token row not found in docs/design-system.md');
  return { dark: row[1], light: row[2] };
}

const toRgb = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `rgb(${r}, ${g}, ${b})`;
};

const meta = (page: Page, attr: 'name' | 'property', key: string) =>
  page.locator(`meta[${attr}="${key}"]`).getAttribute('content');

for (const scheme of ['dark', 'light'] as const) {
  test(`page background is the bg token in ${scheme} mode`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto('/');
    const bg = await page.evaluate(
      () => getComputedStyle(document.body).backgroundColor,
    );
    expect(bg).toBe(toRgb(bgToken()[scheme]));
  });
}

for (const p of PAGES) {
  test.describe(`page ${p.path}`, () => {
    test('has the title, description, canonical, Open Graph and Twitter tags', async ({
      page,
    }) => {
      await page.goto(p.path);
      const url = `${SITE}${p.canonicalPath}`;

      await expect(page).toHaveTitle(p.title);
      expect(await meta(page, 'name', 'description')).toBe(p.description);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        url,
      );
      expect(await meta(page, 'property', 'og:title')).toBe(p.title);
      expect(await meta(page, 'property', 'og:description')).toBe(
        p.description,
      );
      expect(await meta(page, 'property', 'og:url')).toBe(url);
      expect(await meta(page, 'property', 'og:type')).toBe('website');
      expect(await meta(page, 'property', 'og:site_name')).toBe(
        'ai.sandino.ca',
      );
      expect(await meta(page, 'property', 'og:image')).toBe(`${SITE}/og.png`);
      expect(await meta(page, 'property', 'og:image:width')).toBe('1200');
      expect(await meta(page, 'property', 'og:image:height')).toBe('630');
      expect(await meta(page, 'property', 'og:image:alt')).toBe(
        'Practical AI engineering — ai.sandino.ca',
      );
      expect(await meta(page, 'name', 'twitter:card')).toBe(
        'summary_large_image',
      );
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    });

    test('makes no off-origin requests and uses the self-hosted fonts', async ({
      page,
      baseURL,
    }) => {
      const origin = new URL(baseURL!).origin;
      const offOrigin: string[] = [];
      page.on('request', (req) => {
        const url = new URL(req.url());
        if (url.protocol !== 'data:' && url.origin !== origin) {
          offOrigin.push(req.url());
        }
      });
      await page.goto(p.path, { waitUntil: 'networkidle' });
      const fontsLoaded = await page.evaluate(async () => {
        await document.fonts.ready;
        return {
          inter: document.fonts.check('16px "Inter Variable"'),
          geist: document.fonts.check('13px "Geist Mono Variable"'),
        };
      });

      expect(offOrigin).toEqual([]);
      expect(fontsLoaded).toEqual({ inter: true, geist: true });
    });

    test('header has the wordmark home link and the GitHub link', async ({
      page,
    }) => {
      await page.goto(p.path);
      const header = page.getByRole('banner');
      const home = header.locator('a[href="/"]');
      await expect(home).toHaveText('ai.sandino.ca');
      await expect(
        header.getByRole('link', { name: 'Source on GitHub' }),
      ).toHaveAttribute('href', REPO_URL);
    });

    test('footer has the author, the repo link and a hidden pixel field', async ({
      page,
    }) => {
      await page.goto(p.path);
      const footer = page.getByRole('contentinfo');
      await expect(footer).toContainText('Javier Sandino');
      await expect(
        footer.getByRole('link', { name: 'Source on GitHub' }),
      ).toHaveAttribute('href', REPO_URL);
      const field = footer.locator('.pixel-field');
      await expect(field).toHaveAttribute('aria-hidden', 'true');
      expect(await field.locator('.pixel').count()).toBeGreaterThan(0);
    });

    for (const scheme of ['dark', 'light'] as const) {
      test(`has no accessibility violations in ${scheme} mode`, async ({
        page,
      }, testInfo) => {
        await page.emulateMedia({ colorScheme: scheme });
        await page.goto(p.path);
        const results = await new AxeBuilder({ page })
          .withTags(WCAG_TAGS)
          .analyze();
        await testInfo.attach('axe-results', {
          body: JSON.stringify(results, null, 2),
          contentType: 'application/json',
        });
        expect(results.violations).toEqual([]);
      });
    }
  });
}

test('favicon and apple-touch-icon are linked and served', async ({
  page,
  request,
}) => {
  await page.goto('/');
  const icon = page.locator('link[rel="icon"]');
  await expect(icon).toHaveAttribute('type', 'image/svg+xml');
  await expect(icon).toHaveAttribute('href', '/favicon.svg');
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
    'href',
    '/apple-touch-icon.png',
  );

  for (const [path, type] of [
    ['/favicon.svg', 'image/svg+xml'],
    ['/apple-touch-icon.png', 'image/png'],
    ['/og.png', 'image/png'],
  ]) {
    const res = await request.get(path);
    expect(res.status(), path).toBe(200);
    expect(res.headers()['content-type'], path).toContain(type);
  }
});

// Animations running on elements inside the header or footer.
const shellAnimations = (page: Page) =>
  page.evaluate(
    () =>
      document.getAnimations().filter((a) => {
        const target = (a.effect as KeyframeEffect | null)?.target;
        return a.playState === 'running' && !!target?.closest('header, footer');
      }).length,
  );

test.describe('motion', () => {
  test('the pixel field twinkles when motion is allowed', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect.poll(() => shellAnimations(page)).toBeGreaterThan(0);
  });

  test('nothing in the header or footer animates under reduced motion', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    expect(await shellAnimations(page)).toBe(0);
  });
});

test('404 page shows its text and illustration and links home', async ({
  page,
}) => {
  const res = await page.goto(MISSING);
  expect(res?.status()).toBe(404);

  const main = page.getByRole('main');
  await expect(main.getByRole('heading', { level: 1 })).toHaveText(
    'Page not found',
  );
  await expect(main).toContainText(
    "This page escaped the harness. We're writing a check so it never happens again.",
  );
  const img = main.locator('img[src="/404-escaped-node.svg"]');
  await expect(img).toHaveAttribute('alt', '');
  expect(await img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBe(
    320,
  );
  await expect(
    main.getByRole('link', { name: 'Back to the home page' }),
  ).toHaveAttribute('href', '/');
});
