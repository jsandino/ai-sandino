// The card under a hub graph (the Heuristics and Harness Engineering pages):
// a number, a name and a statement, or a prompt when nothing is picked.

import { codeSpans } from '../lib/heuristics';

export type CardData = {
  id: string;
  number: string;
  name: string;
  text: string;
};

export function fillCard(
  card: HTMLElement,
  c: CardData | null,
  prompt: string,
) {
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
    card.replaceChildren(el('p', 'card-prompt', prompt));
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
