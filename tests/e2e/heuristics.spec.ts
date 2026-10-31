// The Twelve Heuristics page (docs/briefs/harness-engineering.md), checked
// against the built site.

import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

test('the page has its title and a way back to the topic', async ({ page }) => {
  await page.goto('/heuristics');
  await expect(page).toHaveTitle('Twelve Heuristics — ai.sandino.ca');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Twelve Heuristics',
  );
  const back = page.getByRole('link', { name: '← Harness Engineering' });
  await expect(back).toHaveAttribute('href', '/harness-engineering');
  await back.click();
  await expect(page).toHaveURL(/\/harness-engineering$/);
});

test('twelve heuristic cards in order', async ({ page }) => {
  await page.goto('/heuristics');
  const cards = page.locator('[data-heuristic]');
  await expect(cards).toHaveCount(12);
  expect(
    await cards.evaluateAll((c) =>
      c.map((e) => (e as HTMLElement).dataset.heuristic),
    ),
  ).toEqual(Array.from({ length: 12 }, (_, i) => String(i + 1)));
  await expect(cards.nth(0).locator('h2')).toHaveText('Map vs. Territory');
  expect(await cards.locator('a').count()).toBe(0);
});

test('at 360px the page does not scroll sideways', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/heuristics');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
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
    await page.goto('/heuristics');
    const { violations } = await new AxeBuilder({ page })
      .withTags(WCAG_TAGS)
      .analyze();
    expect(violations).toEqual([]);
  });
}
