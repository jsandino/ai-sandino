// The Harness Engineering page (docs/briefs/harness-engineering.md),
// checked against the built site.

import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const PARTS = [
  ['foundations', 'Foundations'],
  ['context', 'Context architecture'],
  ['constraints', 'Mechanical constraints'],
  ['capabilities', 'Agent capabilities'],
  ['feedback', 'Feedback loops'],
  ['discipline', 'Operating discipline'],
];

test('the five sections appear in order', async ({ page }) => {
  await page.goto('/harness-engineering');
  const ids = await page
    .locator('main > section')
    .evaluateAll((s) => s.map((e) => e.id));
  expect(ids).toEqual(['hero', 'graph', 'heuristics', 'pdf', 'github']);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Harness Engineering with Code Agents',
  );
});

test('the graph has six nodes with labels, and eleven edges', async ({
  page,
}) => {
  await page.goto('/harness-engineering');
  const nodes = page.locator('[data-node]');
  await expect(nodes).toHaveCount(6);
  for (const [id, label] of PARTS) {
    await expect(page.locator(`[data-node="${id}"] .label`)).toHaveText(label);
  }
  // Each edge is drawn once per layout.
  await expect(page.locator('.edges-wide .edge')).toHaveCount(11);
  await expect(page.locator('.edges-wide .edge[data-directed]')).toHaveCount(3);
  await expect(
    page.locator(
      '[data-edge="feedback-context"], [data-edge="feedback-capabilities"]',
    ),
  ).toHaveCount(0);
});

test('the graph has a text equivalent', async ({ page }) => {
  await page.goto('/harness-engineering');
  const items = page.locator('[data-graph-text] li');
  await expect(items).toHaveCount(6 + 11);
  await expect(items.first()).toContainText(
    'An agent without a harness is a guess generator.',
  );
  await expect(page.locator('[data-harness-graph] .box')).toHaveAttribute(
    'aria-hidden',
    'true',
  );
});

test('twelve heuristic cards in order', async ({ page }) => {
  await page.goto('/harness-engineering');
  const cards = page.locator('[data-heuristic]');
  await expect(cards).toHaveCount(12);
  expect(
    await cards.evaluateAll((c) =>
      c.map((e) => (e as HTMLElement).dataset.heuristic),
    ),
  ).toEqual(Array.from({ length: 12 }, (_, i) => String(i + 1)));
  await expect(cards.nth(0).locator('h3')).toHaveText('map vs. territory');
  expect(await cards.locator('a').count()).toBe(0);
});

test('the PDF and GitHub links point where the brief says', async ({
  page,
  request,
}) => {
  await page.goto('/harness-engineering');
  const pdf = page.getByRole('link', { name: 'Download the guide (PDF)' });
  await expect(pdf).toHaveAttribute('href', '/harness-guide.pdf');
  const res = await request.get('/harness-guide.pdf');
  expect(res.status()).toBe(200);
  await expect(
    page.getByRole('link', { name: 'Browse the source on GitHub' }),
  ).toHaveAttribute(
    'href',
    'https://github.com/jsandino/ai-sandino#practical-ai-engineering',
  );
});

test('the graph enters on scroll, and is settled under reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/harness-engineering');
  const graph = page.locator('[data-harness-graph]');
  await graph.scrollIntoViewIfNeeded();
  await expect(graph).toHaveAttribute('data-anim', 'ready');
  await expect
    .poll(() =>
      page
        .locator('[data-node="feedback"]')
        .evaluate((e) => getComputedStyle(e).opacity),
    )
    .toBe('1');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/harness-engineering');
  await expect(graph).not.toHaveAttribute('data-anim', 'ready');
  await expect(page.locator('[data-node="feedback"]')).toHaveCSS(
    'opacity',
    '1',
  );
});

test('at 360px the page does not scroll sideways and the phone edges show', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/harness-engineering');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(page.locator('.edges-phone')).toBeVisible();
  await expect(page.locator('.edges-wide')).toBeHidden();
  const [a, b] = await Promise.all(
    ['capabilities', 'feedback'].map((id) =>
      page.locator(`[data-node="${id}"]`).boundingBox(),
    ),
  );
  const top = await page.locator('[data-node="foundations"]').boundingBox();
  expect(top!.y).toBeLessThan(a!.y);
  expect(a!.x).toBeLessThan(b!.x);
});

for (const scheme of ['dark', 'light'] as const) {
  test(`has no accessibility violations in ${scheme} mode`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(
      (s) => s === 'light' && localStorage.setItem('theme', 'light'),
      scheme,
    );
    await page.goto('/harness-engineering');
    const { violations } = await new AxeBuilder({ page })
      .withTags(WCAG_TAGS)
      .analyze();
    expect(violations).toEqual([]);
  });
}

for (const [name, width] of [
  ['desktop', 1280],
  ['small desktop', 1024],
  ['tablet', 700],
  ['phone', 360],
] as const) {
  test(`no graph node clips its text at ${name} width`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/harness-engineering');
    const clipped = await page
      .locator('[data-node]')
      .evaluateAll((nodes) =>
        nodes
          .filter(
            (n) =>
              n.scrollHeight > n.clientHeight || n.scrollWidth > n.clientWidth,
          )
          .map((n) => (n as HTMLElement).dataset.node),
      );
    expect(clipped).toEqual([]);
  });
}
