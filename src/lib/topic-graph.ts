// Topic data → the landing graph's nodes, links and input handling
// (docs/briefs/landing.md, Decided #1–#5). Pure, so unit tests can feed it
// fixtures with live topics; the page has none yet.

import type { Topic } from '../data/topics';

export const HUB_ID = 'hub';
export const HUB_LABEL = 'AI';

export type GraphNode = {
  id: string;
  label: string;
  title: string;
  blurb: string;
  hub: boolean;
  live: boolean;
  href?: string; // only for live topics
};

export type GraphLink = {
  source: string;
  target: string;
  kind: 'spoke' | 'related';
};

export type Graph = { nodes: GraphNode[]; links: GraphLink[] };

/** The hub, one node per topic, one spoke per topic, one cross-link per `related` pair. */
export function topicsToGraph(topics: Topic[]): Graph {
  const slugs = new Set(topics.map((t) => t.slug));
  const hub: GraphNode = {
    id: HUB_ID,
    label: HUB_LABEL,
    title: '',
    blurb: '',
    hub: true,
    live: false,
  };
  const nodes = topics.map((t): GraphNode => ({
    id: t.slug,
    label: t.label,
    title: t.title,
    blurb: t.blurb,
    hub: false,
    live: t.status === 'live',
    ...(t.status === 'live' ? { href: `/${t.slug}` } : {}),
  }));
  const spokes = topics.map((t): GraphLink => ({
    source: HUB_ID,
    target: t.slug,
    kind: 'spoke',
  }));

  const pairs = new Set<string>();
  const related = topics.flatMap((t) =>
    (t.related ?? []).map((other): GraphLink => {
      const pair = [t.slug, other].sort().join(' ↔ ');
      if (!slugs.has(other) || other === t.slug || pairs.has(pair)) {
        throw new Error(`BAD RELATED LINK: "${t.slug}" → "${other}"
  Rule: each "related" entry in src/data/topics.ts names another existing
        topic's slug, and each pair is listed on one side only.
  Fix:  correct the slug, or remove the duplicate from one of the two topics.`);
      }
      pairs.add(pair);
      return { source: t.slug, target: other, kind: 'related' };
    }),
  );

  return { nodes: [hub, ...nodes], links: [...spokes, ...related] };
}

export type Action = { navigate: string } | 'select' | null;

/**
 * A click or tap. Desktop: a live node opens its page, others are
 * previewed. Phone (tap): every tap selects; the card's link opens the page.
 */
export function clickAction(
  node: Pick<GraphNode, 'href'>,
  tap: boolean,
): Action {
  return node.href && !tap ? { navigate: node.href } : 'select';
}

/** A key press on a focused node: Enter opens a live topic; Enter or Space selects otherwise. */
export function keyAction(node: Pick<GraphNode, 'href'>, key: string): Action {
  if (key === 'Enter' && node.href) return { navigate: node.href };
  return key === 'Enter' || key === ' ' ? 'select' : null;
}

export const CARD_PROMPT = 'Pick a topic to see what it covers.';

export type CardContent = {
  title: string;
  badge: { text: 'Live' | 'Coming soon'; live: boolean };
  blurb: string;
  link?: { text: 'Read the topic →'; href: string };
};

/** What the card under the graph shows for a topic. */
export function cardContent(node: GraphNode): CardContent {
  return {
    title: node.title,
    badge: node.live
      ? { text: 'Live', live: true }
      : { text: 'Coming soon', live: false },
    blurb: node.blurb,
    ...(node.href
      ? { link: { text: 'Read the topic →', href: node.href } }
      : {}),
  };
}
