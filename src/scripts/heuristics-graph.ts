// Brings the Heuristics page's graph to life (docs/briefs/harness-engineering.md,
// *Heuristics*): fills the heuristic card from the node that is hovered, focused or selected, and
// hands the entrance and rest motion to the shared hub-graph script.

import { CARD_PROMPT, codeSpans } from '../lib/heuristics';
import { animateHubGraph, wireHubHover } from './hub-graph';

type CardData = { id: string; number: string; name: string; text: string };

function fillCard(card: HTMLElement, c: CardData | null) {
  // Already showing this one: keep the DOM.
  if (card.dataset.shown === (c?.id ?? '')) return;
  card.dataset.shown = c?.id ?? '';
  card.classList.toggle('empty', !c);
  const el = (tag: string, cls: string, text = '') => {
    const e = document.createElement(tag);
    e.className = cls;
    e.textContent = text;
    return e;
  };
  if (!c) {
    card.replaceChildren(el('p', 'card-prompt', CARD_PROMPT));
    return;
  }
  const text = el('p', 'card-text');
  codeSpans(c.text).forEach((s, i) => {
    if (i % 2) text.append(el('code', '', s));
    else text.append(s);
  });
  card.replaceChildren(
    el('span', 'card-number', c.number),
    el('h3', '', c.name),
    text,
  );
}

export function mountHeuristicsGraph(root: HTMLElement): void {
  const cards = JSON.parse(root.dataset.cards ?? '[]') as CardData[];
  const graph = root.querySelector<HTMLElement>('[data-graph]')!;
  const card = root.querySelector<HTMLElement>('[data-card]')!;

  wireHubHover(root, (id) =>
    fillCard(card, cards.find((c) => c.id === id) ?? null),
  );
  animateHubGraph(graph);
}
