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
  expect(html).toMatch(/<h1[^>]*>[^<]+<\/h1>/);
});
