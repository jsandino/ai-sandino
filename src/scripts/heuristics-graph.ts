// Brings the Heuristics page's graph to life (docs/briefs/harness-engineering.md,
// *Heuristics*): fills the heuristic card from the node that is hovered, focused or selected, and
// hands the entrance and rest motion to the shared hub-graph script.

import { CARD_PROMPT } from '../lib/heuristics';
import { fillCard, type CardData } from './graph-card';
import { animateHubGraph, wireHubHover } from './hub-graph';

export function mountHeuristicsGraph(root: HTMLElement): void {
  const cards = JSON.parse(root.dataset.cards ?? '[]') as CardData[];
  const graph = root.querySelector<HTMLElement>('[data-graph]')!;
  const card = root.querySelector<HTMLElement>('[data-card]')!;

  wireHubHover(root, (id) =>
    fillCard(card, cards.find((c) => c.id === id) ?? null, CARD_PROMPT),
  );
  animateHubGraph(graph);
}
