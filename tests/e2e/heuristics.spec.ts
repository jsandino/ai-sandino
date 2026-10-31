// The Heuristics page (docs/briefs/harness-engineering.md), checked against
// the built site.

import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const NAMES = [
  'Map vs. Territory',
  'Progressive Disclosure',
  'Mechanical Enforcement',
  'Skills vs. Docs',
  'Earn the Check',
  'Errors as Remediation',
  'Fast Feedback Wins',
  'Immutable Decisions',
  'Sub-Agents as Firewalls',
  'Watch the Loop',
  'Compound the Fixes',
  'Project as Source of Truth',
];
const PROMPT = 'Pick a heuristic to see what it says.';

const node = (page: Page, n: number) =>
  page.locator(`[data-node="h${n}"]:visible`);
const card = (page: Page) => page.locator('[data-card]');

// Settled (no entrance), and the graph scrolled clear of the sticky header.
async function open(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/heuristics');
  await page
    .locator('[data-graph]')
    .evaluate((e) => e.scrollIntoView({ block: 'center' }));
}

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

test('the graph has the hub, twelve named nodes in order, and twelve edges', async ({
  page,
}) => {
  await open(page);
  await expect(page.locator('[data-node]:visible')).toHaveCount(13);
  await expect(
    page.locator('[data-node="heuristics"]:visible .hub-label'),
  ).toHaveText('Heuristics');
  for (const [i, name] of NAMES.entries()) {
    await expect(node(page, i + 1).locator('.label')).toHaveText(name);
    await expect(node(page, i + 1)).toHaveAttribute('aria-label', name);
  }
  await expect(page.locator('.graph-wide .edge')).toHaveCount(12);
  // The plain list gives way to the graph.
  await expect(page.locator('[data-list]')).toBeHidden();
});

test('the card prompts, then shows the hovered heuristic, then prompts again', async ({
  page,
}) => {
  await open(page);
  await expect(card(page)).toHaveText(PROMPT);
  await node(page, 4).locator('.core').hover();
  await expect(card(page).locator('.card-number')).toHaveText('04');
  await expect(card(page).locator('h3')).toHaveText('Skills vs. Docs');
  // The statement starts with a capital.
  await expect(card(page).locator('.card-text')).toHaveText(
    /^Skills are for workflows; docs are for knowledge\./,
  );
  // The rest of the graph dims, the hub stays lit.
  await expect(node(page, 5)).toHaveCSS('opacity', '0.3');
  await expect(page.locator('[data-node="heuristics"]:visible')).toHaveCSS(
    'opacity',
    '1',
  );
  await expect(
    page.locator('.graph-wide .edge[data-edge="heuristics-h4"]'),
  ).toHaveClass(/hl/);

  await page.mouse.move(0, 0);
  await expect(card(page)).toHaveText(PROMPT);
  await expect(node(page, 5)).toHaveCSS('opacity', '1');
});

test('a statement that opens with a code span keeps it, with the code styled', async ({
  page,
}) => {
  await open(page);
  await node(page, 1).locator('.core').hover();
  await expect(card(page).locator('.card-text')).toHaveText(
    /^CLAUDE\.md routes; docs\/ knows\./,
  );
  await expect(card(page).locator('.card-text code').first()).toHaveText(
    'CLAUDE.md',
  );
});

test('the card stays while the pointer moves from a node onto it', async ({
  page,
}) => {
  await open(page);
  await node(page, 7).locator('.core').hover();
  await card(page).hover();
  await expect(card(page).locator('h3')).toHaveText('Fast Feedback Wins');
});

test('a click selects a heuristic and a second click clears it', async ({
  page,
}) => {
  await open(page);
  await node(page, 8).locator('.core').click();
  await expect(card(page).locator('h3')).toHaveText('Immutable Decisions');
  // Selected: hovering another node does not replace it, and leaving keeps it.
  await node(page, 2).locator('.core').hover();
  await expect(card(page).locator('h3')).toHaveText('Immutable Decisions');
  await page.mouse.move(0, 0);
  await expect(card(page).locator('h3')).toHaveText('Immutable Decisions');
  await node(page, 8).locator('.core').click();
  await page.mouse.move(0, 0);
  await expect(card(page)).toHaveText(PROMPT);
});

test('the keyboard previews on focus, selects on Enter and clears on Escape', async ({
  page,
}) => {
  await open(page);
  await node(page, 3).focus();
  await expect(card(page).locator('h3')).toHaveText('Mechanical Enforcement');
  await page.keyboard.press('Enter');
  await node(page, 6).focus();
  await expect(card(page).locator('h3')).toHaveText('Errors as Remediation');
  // Leaving the graph restores the selection.
  await page.locator('body').focus();
  await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
  await expect(card(page).locator('h3')).toHaveText('Mechanical Enforcement');
  await node(page, 3).focus();
  await page.keyboard.press('Escape');
  await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
  await expect(card(page)).toHaveText(PROMPT);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the twelve heuristics show as a list, with capitalised statements', async ({
    page,
  }) => {
    await page.goto('/heuristics');
    const items = page.locator('[data-heuristic]');
    await expect(items).toHaveCount(12);
    await expect(items.nth(0).locator('h2')).toHaveText('Map vs. Territory');
    await expect(items.nth(8)).toContainText('Delegate research');
    await expect(page.locator('[data-graph]')).toBeHidden();
  });
});

test('the graph enters on scroll under motion, and the hub sparks', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/heuristics');
  await page
    .locator('[data-graph]')
    .evaluate((e) => e.scrollIntoView({ block: 'center' }));
  await expect(page.locator('[data-graph]')).toHaveAttribute(
    'data-anim',
    'ready',
  );
  await expect
    .poll(() =>
      node(page, 12)
        .locator('.body')
        .evaluate((e) => getComputedStyle(e).opacity),
    )
    .toBe('1');
  await expect(page.locator('.graph-wide .spark').first()).toBeAttached({
    timeout: 10000,
  });
});

test('at 360px the page does not scroll sideways and the phone layout shows', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await open(page);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(page.locator('.graph-phone')).toBeVisible();
  await expect(page.locator('.graph-wide')).toBeHidden();
});

for (const [name, width] of [
  ['desktop', 1280],
  ['small desktop', 1024],
  ['tablet', 700],
  ['phone', 360],
] as const) {
  test(`no label leaves the graph or overlaps another at ${name} width`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await open(page);
    const box = (await page.locator('.box').boundingBox())!;
    const labels = await page
      .locator('[data-node]:visible .label')
      .evaluateAll((els) =>
        els.map((e) => {
          const r = e.getBoundingClientRect();
          return { x: r.x, y: r.y, w: r.width, h: r.height };
        }),
      );
    expect(labels).toHaveLength(12);
    for (const l of labels) {
      expect(l.x).toBeGreaterThanOrEqual(box.x);
      expect(l.x + l.w).toBeLessThanOrEqual(box.x + box.width);
      expect(l.y).toBeGreaterThanOrEqual(box.y);
      expect(l.y + l.h).toBeLessThanOrEqual(box.y + box.height);
    }
    for (const [i, a] of labels.entries())
      for (const b of labels.slice(i + 1))
        expect(
          a.x < b.x + b.w &&
            b.x < a.x + a.w &&
            a.y < b.y + b.h &&
            b.y < a.y + a.h,
        ).toBe(false);
  });
}

for (const scheme of ['dark', 'light'] as const) {
  test(`has no accessibility violations in ${scheme} mode, card empty or filled`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(
      (s) => s === 'light' && localStorage.setItem('theme', 'light'),
      scheme,
    );
    await page.goto('/heuristics');
    const scan = () => new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect((await scan()).violations).toEqual([]);
    await node(page, 9).focus();
    await expect(card(page).locator('h3')).toHaveText(
      'Sub-Agents as Firewalls',
    );
    expect((await scan()).violations).toEqual([]);
  });
}
