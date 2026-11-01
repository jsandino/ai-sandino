// The Harness Engineering page (docs/briefs/harness-engineering.md),
// checked against the built site.

import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const PARTS = [
  ['foundations', 'Foundations'],
  ['context', 'Context Architecture'],
  ['constraints', 'Mechanical Constraints'],
  ['capabilities', 'Agent Capabilities'],
  ['feedback', 'Feedback Loops'],
  ['discipline', 'Operating Discipline'],
];

test('the four sections appear in order', async ({ page }) => {
  await page.goto('/harness-engineering');
  const ids = await page
    .locator('main > section')
    .evaluateAll((s) => s.map((e) => e.id));
  expect(ids).toEqual(['hero', 'graph', 'pdf', 'github']);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Harness Engineering with Code Agents',
  );
});

test('the graph has the hub and six parts with labels, and six edges', async ({
  page,
}) => {
  await page.goto('/harness-engineering');
  const nodes = page.locator('[data-node]:visible');
  await expect(nodes).toHaveCount(7);
  await expect(
    page.locator('[data-node="heuristics"]:visible .hub-label'),
  ).toHaveText('Heuristics');
  for (const [id, label] of PARTS) {
    await expect(page.locator(`[data-node="${id}"]:visible .label`)).toHaveText(
      label,
    );
  }
  // Each edge is drawn once per layout.
  await expect(page.locator('.graph-wide .edge')).toHaveCount(6);
  await expect(
    page.locator(
      '[data-edge="feedback-context"], [data-edge="foundations-context"]',
    ),
  ).toHaveCount(0);
});

test('the graph has a text equivalent', async ({ page }) => {
  await page.goto('/harness-engineering');
  const items = page.locator('[data-graph-text] li');
  await expect(items).toHaveCount(6 + 6 + 1);
  await expect(items.first()).toContainText(
    'An agent without a harness is a guess generator.',
  );
  await expect(page.locator('[data-harness-graph] .box')).toHaveAttribute(
    'aria-hidden',
    'true',
  );
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
        .locator('[data-node="feedback"]:visible .body')
        .evaluate((e) => getComputedStyle(e).opacity),
    )
    .toBe('1');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/harness-engineering');
  await expect(graph).not.toHaveAttribute('data-anim', 'ready');
  await expect(page.locator('[data-node="feedback"]:visible .body')).toHaveCSS(
    'opacity',
    '1',
  );
});

test('at 360px the page does not scroll sideways and the phone edges show', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/harness-engineering');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(page.locator('.graph-phone')).toBeVisible();
  await expect(page.locator('.graph-wide')).toBeHidden();
  const at = async (id: string) =>
    (await page.locator(`[data-node="${id}"]:visible .ring`).boundingBox())!;
  const [
    hub,
    foundations,
    context,
    constraints,
    capabilities,
    feedback,
    discipline,
  ] = await Promise.all(
    [
      'heuristics',
      'foundations',
      'context',
      'constraints',
      'capabilities',
      'feedback',
      'discipline',
    ].map(at),
  );
  // The hub is in the middle and the parts go round it clockwise from the
  // top left: I, II (top), III (right), IV, V (bottom), VI (left).
  expect(foundations.y).toBeLessThan(hub.y);
  expect(context.y).toBeLessThan(hub.y);
  expect(foundations.x).toBeLessThan(context.x);
  expect(hub.x).toBeLessThan(constraints.x);
  expect(capabilities.y).toBeGreaterThan(hub.y);
  expect(feedback.y).toBeGreaterThan(hub.y);
  expect(feedback.x).toBeLessThan(capabilities.x);
  expect(discipline.x).toBeLessThan(hub.x);
});

test('hovering a node dims the rest and lights its edge; leaving restores', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/harness-engineering');
  const node = (id: string) => page.locator(`[data-node="${id}"]:visible`);
  await page
    .locator('[data-harness-graph]')
    .evaluate((e) => e.scrollIntoView({ block: 'center' }));
  await node('constraints').locator('.core').hover();
  // Only the hub and the hovered node stay lit.
  for (const id of ['heuristics', 'constraints'])
    await expect(node(id)).toHaveCSS('opacity', '1');
  for (const id of [
    'foundations',
    'discipline',
    'capabilities',
    'context',
    'feedback',
  ])
    await expect(node(id)).toHaveCSS('opacity', '0.3');
  await expect(
    page.locator('.graph-wide .edge[data-edge="heuristics-constraints"]'),
  ).toHaveClass(/hl/);
  await expect(
    page.locator('.graph-wide .edge[data-edge="heuristics-capabilities"]'),
  ).toHaveClass(/dim/);

  await page.mouse.move(0, 0);
  await expect(node('foundations')).toHaveCSS('opacity', '1');
});

test('the card prompts, then shows the hovered part, then prompts again', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/harness-engineering');
  const card = page.locator('[data-card]');
  await page
    .locator('[data-harness-graph]')
    .evaluate((e) => e.scrollIntoView({ block: 'center' }));
  await expect(card).toHaveText('Pick a part to see what it covers.');
  await page
    .locator('[data-node="constraints"]:visible')
    .locator('.core')
    .hover();
  await expect(card.locator('.card-number')).toHaveText('Part III');
  await expect(card.locator('h3')).toHaveText('Mechanical Constraints');
  await expect(card.locator('.card-text')).toHaveText(
    "If a rule matters, make it mechanical. Prose drifts, checks don't.",
  );
  await page.mouse.move(0, 0);
  await expect(card).toHaveText('Pick a part to see what it covers.');
});

test('the hub opens the heuristics page, and so does the text list', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/harness-engineering');
  await expect(page.locator('[data-graph-text] a')).toHaveAttribute(
    'href',
    '/heuristics',
  );
  await page
    .locator('[data-harness-graph]')
    .evaluate((e) => e.scrollIntoView({ block: 'center' }));
  await page.locator('[data-node="heuristics"]:visible .ring').click();
  await expect(page).toHaveURL(/\/heuristics$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Twelve Heuristics',
  );
});

test('the hub link shows no outline or tap highlight', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/harness-engineering');
  const link = page.locator('.graph-wide a[href="/heuristics"]');
  await expect(link).toHaveCSS('outline-style', 'none');
  await expect(link).toHaveCSS(
    '-webkit-tap-highlight-color',
    'rgba(0, 0, 0, 0)',
  );
});

test('the hub sparks within 10s under motion, and not under reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/harness-engineering');
  await page.locator('[data-harness-graph]').scrollIntoViewIfNeeded();
  const spark = page.locator('.graph-wide .spark').first();
  await expect(spark).toBeAttached({ timeout: 10000 });
  await expect(spark).toHaveAttribute('aria-hidden', 'true');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/harness-engineering');
  await page.waitForTimeout(1000);
  expect(await page.locator('.spark').count()).toBe(0);
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
  test(`no graph label leaves the graph or overlaps another at ${name} width`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/harness-engineering');
    const box = (await page.locator('.box').boundingBox())!;
    const labels = await page
      .locator('[data-node]:visible .label')
      .evaluateAll((els) =>
        els.map((e) => {
          const r = e.getBoundingClientRect();
          return { x: r.x, y: r.y, w: r.width, h: r.height };
        }),
      );
    for (const l of labels) {
      expect(l.x).toBeGreaterThanOrEqual(box.x);
      expect(l.x + l.w).toBeLessThanOrEqual(box.x + box.width);
      expect(l.y + l.h).toBeLessThanOrEqual(box.y + box.height + 40);
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
