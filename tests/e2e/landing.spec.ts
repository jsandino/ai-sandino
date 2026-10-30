// The landing page (docs/briefs/landing.md, acceptance criteria 1, 4, 6–8
// and 10–15), checked against the built site. Positions vary by screen, so
// these check structure and behaviour, never coordinates.

import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { topics } from '../../src/data/topics';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const PROMPT = 'Pick a topic to see what it covers.';
// Entrance: the last of six nodes starts gliding at 150 + 5 × 260ms and
// takes 1600ms (src/scripts/topic-graph.ts).
const ENTRANCE_MS = 3050;

const graph = (page: Page) => page.locator('svg.topic-graph');
const topicNode = (page: Page, slug: string) =>
  graph(page).locator(`g.node[data-id="${slug}"]`);
const card = (page: Page) => page.locator('[data-card]');

// A node's centre in viewBox units, from its translate().
const centres = (page: Page) =>
  graph(page).evaluate((svg) =>
    Object.fromEntries(
      [...svg.querySelectorAll<SVGGElement>('g.node')].map((g) => {
        const [x, y] = (g.getAttribute('transform') ?? '')
          .match(/-?[\d.]+/g)!
          .map(Number);
        return [g.dataset.id, { x, y }];
      }),
    ),
  );

test.describe('content', () => {
  test('hero has the title with the accent on "engineering" and the supporting line', async ({
    page,
  }) => {
    await page.goto('/');
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toHaveText('Practical AI engineering');
    const accent = h1.locator('span');
    await expect(accent).toHaveText('engineering');
    const [color, token] = await accent.evaluate((el) => {
      const probe = document.createElement('span');
      probe.style.color = 'var(--color-accent-strong)';
      document.body.append(probe);
      const t = getComputedStyle(probe).color;
      probe.remove();
      return [getComputedStyle(el).color, t];
    });
    expect(color).toBe(token);
    await expect(page.locator('main p').first()).toHaveText(
      'Learn how AI systems actually get built — from first principles to production.',
    );
  });

  test('graph shows all five topics and the AI hub, and only live topics are links and tagged', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(graph(page)).toHaveAttribute(
      'aria-label',
      'The five topics, as a graph.',
    );
    const ids = await graph(page)
      .locator('g.node:not(.hub)')
      .evaluateAll((gs) => gs.map((g) => (g as SVGGElement).dataset.id));
    expect(ids).toEqual(topics.map((t) => t.slug));
    await expect(graph(page).locator('g.node.hub text')).toHaveText('AI');
    expect(await graph(page).locator('a, [role="link"]').count()).toBe(
      topics.filter((t) => t.status === 'live').length,
    );
    expect(await graph(page).locator('.tag').count()).toBe(
      topics.filter((t) => t.status === 'live').length,
    );
  });

  test('the Topics heading stays for screen readers and the list is replaced', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Topics' })).toBeAttached();
    await expect(page.locator('[data-topic-list] ul')).toBeHidden();
  });

  test('card is a polite live region showing the prompt when idle', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(card(page)).toHaveAttribute('aria-live', 'polite');
    await expect(card(page)).toHaveText(PROMPT);
  });

  test('grid and beams are decorative and hidden from assistive tech', async ({
    page,
  }) => {
    await page.goto('/');
    const backdrop = page.locator('.backdrop');
    await expect(backdrop).toHaveAttribute('aria-hidden', 'true');
    expect(await backdrop.locator('.grid-bg').count()).toBe(1);
    expect(await backdrop.locator('.beam').count()).toBe(6);
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the Topics list shows every topic with its blurb, and links only for live topics', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Topics' })).toBeVisible();
    const items = page.locator('[data-topic-list] li');
    await expect(items).toHaveCount(topics.length);
    for (const [i, t] of topics.entries()) {
      await expect(items.nth(i)).toContainText(t.title);
      await expect(items.nth(i)).toContainText(t.blurb);
    }
    expect(await page.locator('[data-topic-list] a').count()).toBe(
      topics.filter((t) => t.status === 'live').length,
    );
    await expect(graph(page)).toBeHidden();
  });
});

test.describe('desktop interaction', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('hover fills the card with title, badge and blurb; leaving shows the prompt', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const t = topics[1];
    await topicNode(page, t.slug).locator('.ring').hover();
    await expect(card(page).locator('h3')).toHaveText(t.title);
    await expect(card(page).locator('.badge')).toHaveText('Coming soon');
    await expect(card(page).locator('.card-blurb')).toHaveText(t.blurb);
    await page.mouse.move(2, 2);
    await expect(card(page)).toHaveText(PROMPT);
  });

  test('the card link of a live topic stays reachable from the node and opens the page', async ({
    page,
  }) => {
    // Tall enough that the card is on screen without scrolling.
    await page.setViewportSize({ width: 1280, height: 1300 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const t = topics[0];
    await topicNode(page, t.slug).locator('.ring').hover();
    const link = card(page).locator('a.card-link');
    await expect(link).toHaveText('Read the topic →');
    // Move across the gap between graph and card, as a real pointer would.
    const box = (await link.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
      steps: 20,
    });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(new RegExp(`/${t.slug}/?$`));
  });

  test('moving focus from a live node to the card link keeps the card', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const t = topics[0];
    await topicNode(page, t.slug).focus();
    const link = card(page).locator('a.card-link');
    await link.focus();
    await expect(link).toBeFocused();
    await expect(card(page).locator('h3')).toHaveText(t.title);
  });

  test('every topic is reachable by keyboard, with a visible focus style, and focus fills the card', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await graph(page).locator('g.node:not(.hub)').first().focus();
    for (const [i, t] of topics.entries()) {
      if (i > 0) await page.keyboard.press('Tab');
      const node = topicNode(page, t.slug);
      await expect(node).toBeFocused();
      const ring = node.locator('.ring');
      await expect
        .poll(() => ring.evaluate((el) => getComputedStyle(el).strokeWidth))
        .toBe('2.5px');
      await expect(card(page).locator('h3')).toHaveText(t.title);
    }
  });

  test('Enter on a coming-soon topic selects it without navigating', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const t = topics[2];
    await topicNode(page, t.slug).focus();
    await page.keyboard.press('Enter');
    await expect(card(page).locator('h3')).toHaveText(t.title);
    expect(new URL(page.url()).pathname).toBe('/');
  });

  test('no accessibility violations with a topic previewed, in both themes', async ({
    page,
  }, testInfo) => {
    for (const scheme of ['dark', 'light'] as const) {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      // The theme is a saved choice (docs/decisions/0015); a later init
      // script runs last, so it wins on the second pass.
      await page.addInitScript((s) => localStorage.setItem('theme', s), scheme);
      await page.goto('/');
      await topicNode(page, topics[0].slug).focus();
      await expect(card(page).locator('h3')).toHaveText(topics[0].title);
      const results = await new AxeBuilder({ page })
        .withTags(WCAG_TAGS)
        .analyze();
      await testInfo.attach(`axe-results-${scheme}`, {
        body: JSON.stringify(results, null, 2),
        contentType: 'application/json',
      });
      expect(results.violations).toEqual([]);
    }
  });
});

test.describe('phone', () => {
  test.use({
    viewport: { width: 360, height: 780 },
    hasTouch: true,
    isMobile: true,
  });

  test('uses the portrait frame and every node and label fits inside it', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(graph(page)).toHaveAttribute('viewBox', '0 0 360 560');
    await page.waitForTimeout(ENTRANCE_MS + 300);
    const outside = await graph(page).evaluate((svg) => {
      const frame = svg.getBoundingClientRect();
      return [...svg.querySelectorAll<SVGGElement>('g.node')].flatMap((g) => {
        const r = g.getBoundingClientRect();
        const inside =
          r.left >= frame.left &&
          r.right <= frame.right &&
          r.top >= frame.top &&
          r.bottom <= frame.bottom;
        return inside ? [] : [g.dataset.id];
      });
    });
    expect(outside).toEqual([]);
    const size = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    expect(size.scroll).toBe(size.client);
  });

  test('a tap selects a topic and fills the card without navigating; a second tap clears it', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const t = topics[3];
    const ring = topicNode(page, t.slug).locator('.ring');
    await ring.tap();
    await expect(card(page).locator('h3')).toHaveText(t.title);
    await expect(card(page).locator('.badge')).toHaveText('Coming soon');
    expect(new URL(page.url()).pathname).toBe('/');
    await ring.tap();
    await expect(card(page)).toHaveText(PROMPT);
  });

  test('after tapping a live topic, tapping the card link opens its page', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const t = topics[0];
    await topicNode(page, t.slug).locator('.ring').tap();
    await expect(card(page).locator('h3')).toHaveText(t.title);
    await card(page).locator('a.card-link').tap();
    await expect(page).toHaveURL(new RegExp(`/${t.slug}/?$`));
  });
});

test.describe('motion', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('the entrance glides outward: no node moves back toward the centre', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    const samples = await graph(page).evaluate(
      (svg, ms) =>
        new Promise<Record<string, number>[]>((resolve) => {
          const [, , w, h] = svg
            .getAttribute('viewBox')!
            .split(' ')
            .map(Number);
          const out: Record<string, number>[] = [];
          const t0 = performance.now();
          const sample = () => {
            out.push(
              Object.fromEntries(
                [...svg.querySelectorAll<SVGGElement>('g.node:not(.hub)')].map(
                  (g) => {
                    const [x, y] = g
                      .getAttribute('transform')!
                      .match(/-?[\d.]+/g)!
                      .map(Number);
                    return [g.dataset.id, Math.hypot(x - w / 2, y - h / 2)];
                  },
                ),
              ),
            );
            if (performance.now() - t0 < ms) requestAnimationFrame(sample);
            else resolve(out);
          };
          sample();
        }),
      ENTRANCE_MS,
    );
    expect(samples.length).toBeGreaterThan(20);
    const backwards = topics.flatMap((t) =>
      samples
        .slice(1)
        .flatMap((s, i) =>
          s[t.slug] < samples[i][t.slug] - 0.5
            ? [
                `${t.slug}: ${samples[i][t.slug].toFixed(1)} → ${s[t.slug].toFixed(1)}`,
              ]
            : [],
        ),
    );
    expect(backwards).toEqual([]);
  });

  test('the hub sparks within 8s, and the spark is hidden from assistive tech', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    const spark = graph(page).locator('.spark').first();
    await expect(spark).toBeAttached({ timeout: 8000 });
    await expect(spark).toHaveAttribute('aria-hidden', 'true');
  });

  test('under reduced motion nothing animates, no spark appears and the beams are hidden', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      (window as unknown as { sparks: number }).sparks = 0;
      new MutationObserver((records) => {
        for (const r of records)
          for (const n of r.addedNodes)
            if (n instanceof Element && n.matches('.spark'))
              (window as unknown as { sparks: number }).sparks++;
      }).observe(document.body, { subtree: true, childList: true });
    });
    const before = await centres(page);
    await page.waitForTimeout(ENTRANCE_MS + 2000);

    expect(
      await page.evaluate(
        () =>
          document.getAnimations().filter((a) => a.playState === 'running')
            .length,
      ),
    ).toBe(0);
    expect(
      await page.evaluate(
        () => (window as unknown as { sparks: number }).sparks,
      ),
    ).toBe(0);
    expect(await graph(page).locator('.spark').count()).toBe(0);
    expect(await centres(page)).toEqual(before);
    for (const beam of await page.locator('.beam').all()) {
      await expect(beam).toBeHidden();
    }
  });
});
