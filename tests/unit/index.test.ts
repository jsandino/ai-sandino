// Smoke test for the unit layer: the landing page renders as a full
// document with a heading. The Container API is still experimental
// (docs/decisions/0013-test-layers.md).

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Index from '../../src/pages/index.astro';

test('index renders a full page with an <h1>', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Index, { partial: false });

  expect(html).toMatch(/^<!DOCTYPE html>/i);
  // The heading may contain markup (e.g. an accent <span>); what matters is
  // that it exists and has visible text once tags are removed.
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  expect(h1, 'expected an <h1> element').not.toBeNull();
  expect(h1![1].replace(/<[^>]+>/g, '').trim()).not.toBe('');
});
