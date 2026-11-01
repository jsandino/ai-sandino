// The Harness Engineering page's graph: hover fills the part card, then the
// entrance and rest motion, both shared with the other hub graphs
// (src/scripts/hub-graph.ts).

import { CARD_PROMPT } from '../lib/harness-graph';
import { fillCard, type CardData } from './graph-card';
import { animateHubGraph, wireHubHover } from './hub-graph';

export function mountHarnessGraph(root: HTMLElement): void {
  const cards = JSON.parse(root.dataset.cards ?? '[]') as CardData[];
  const card = root.querySelector<HTMLElement>('[data-card]')!;

  wireHubHover(root, (id) =>
    fillCard(card, cards.find((c) => c.id === id) ?? null, CARD_PROMPT),
  );
  animateHubGraph(root);
}
