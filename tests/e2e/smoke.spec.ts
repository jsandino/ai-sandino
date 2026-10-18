// Smoke test for the end-to-end layer: the built landing page loads and
// has no axe violations at WCAG 2.2 AA (docs/decisions/0013-test-layers.md).

import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

test('home loads with a heading and no accessibility violations', async ({
  page,
}, testInfo) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();

  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  await testInfo.attach('axe-results', {
    body: JSON.stringify(results, null, 2),
    contentType: 'application/json',
  });
  expect(results.violations).toEqual([]);
});
