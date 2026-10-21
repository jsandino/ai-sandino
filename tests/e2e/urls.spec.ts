// URL rules for the built site: one URL form everywhere, and the 404 page
// where Cloudflare Pages looks for it. The routes are listed without a
// trailing slash in docs/architecture.md; these tests check the build agrees.

import { expect, test } from '@playwright/test';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = join(import.meta.dirname, '../../dist');
const SITE = 'https://ai.sandino.ca';

// Every built HTML file, relative to dist/.
function htmlFiles(dir = DIST): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(full);
    return entry.name.endsWith('.html') ? [relative(DIST, full)] : [];
  });
}

// Page URLs a built file declares or links to: canonical, og:url and every
// same-site <a href>. Assets (files with an extension) and pure #anchors are
// not page URLs.
function pageUrls(html: string): { kind: string; path: string }[] {
  const urls: { kind: string; path: string }[] = [];
  const canonical = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/);
  if (canonical) urls.push({ kind: 'canonical', path: canonical[1] });
  const ogUrl = html.match(/<meta[^>]+property="og:url"[^>]+content="([^"]+)"/);
  if (ogUrl) urls.push({ kind: 'og:url', path: ogUrl[1] });
  for (const [, href] of html.matchAll(/<a[^>]+href="([^"]+)"/g)) {
    urls.push({ kind: 'link', path: href });
  }
  return urls
    .map(({ kind, path }) => ({
      kind,
      path: path.startsWith(SITE) ? path.slice(SITE.length) || '/' : path,
    }))
    .filter(({ path }) => path.startsWith('/'))
    .map(({ kind, path }) => ({ kind, path: path.split('#')[0] }))
    .filter(({ path }) => path !== '' && !/\.(?!html$)[a-z0-9]+$/i.test(path));
}

const FILES = htmlFiles();

test('the 404 page is built as 404.html at the root, where Cloudflare Pages looks for it', () => {
  expect(existsSync(join(DIST, '404.html'))).toBe(true);
});

for (const file of FILES) {
  test(`${file}: page URLs use one form (no trailing slash, no .html)`, () => {
    const bad = pageUrls(readFileSync(join(DIST, file), 'utf8')).filter(
      ({ path }) =>
        path !== '/' && (path.endsWith('/') || path.endsWith('.html')),
    );
    expect(bad, 'URLs with a trailing slash or .html').toEqual([]);
  });

  // astro preview doesn't reproduce Cloudflare's redirects, so this only
  // proves the canonical resolves to a built page; the one-form test above
  // is what keeps it redirect-free in production (docs/decisions/0014).
  test(`${file}: the canonical URL resolves to a built page`, async ({
    request,
  }) => {
    const canonical = pageUrls(readFileSync(join(DIST, file), 'utf8')).find(
      ({ kind }) => kind === 'canonical',
    );
    test.skip(!canonical, 'no canonical tag');
    const response = await request.get(canonical!.path, { maxRedirects: 0 });
    expect(response.status(), `GET ${canonical!.path}`).toBe(200);
  });
}
