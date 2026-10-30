// Topic data → the landing graph (docs/briefs/landing.md, acceptance
// criteria 2, 3, 5, 6 and 9). The real build has no live topic, so live
// behaviour is checked with fixtures.

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import TopicGraph from '../../src/components/TopicGraph.astro';
import { topics, type Topic } from '../../src/data/topics';
import {
  CARD_PROMPT,
  HUB_ID,
  cardContent,
  clickAction,
  keyAction,
  topicsToGraph,
} from '../../src/lib/topic-graph';

const BLURBS_DOC = join(
  import.meta.dirname,
  '../../docs/content/topic-blurbs.md',
);

// A fixture with one live topic, as step 8 will have.
const withLive: Topic[] = topics.map((t) =>
  t.slug === 'harness-engineering' ? { ...t, status: 'live' } : t,
);

describe('topicsToGraph', () => {
  const { nodes, links } = topicsToGraph(topics);
  const ids = new Set(nodes.map((n) => n.id));

  test('has the AI hub and one node per topic', () => {
    expect(nodes.filter((n) => n.hub).map((n) => n.label)).toEqual(['AI']);
    expect(nodes.filter((n) => !n.hub).map((n) => n.id)).toEqual(
      topics.map((t) => t.slug),
    );
  });

  test('has one spoke per topic, from the hub', () => {
    const spokes = links.filter((l) => l.kind === 'spoke');
    expect(spokes).toEqual(
      topics.map((t) => ({ source: HUB_ID, target: t.slug, kind: 'spoke' })),
    );
  });

  test('has one cross-link per related pair, as the brief lists them', () => {
    const pairs = links
      .filter((l) => l.kind === 'related')
      .map((l) => [l.source, l.target].sort().join(' ↔ '))
      .sort();
    expect(pairs).toEqual(
      [
        'rag-in-production ↔ transformer-architecture',
        'llm-gateway ↔ rag-in-production',
        'agents-with-adk ↔ llm-gateway',
        'agents-with-adk ↔ harness-engineering',
      ].sort(),
    );
  });

  test('every link joins two existing nodes', () => {
    for (const l of links) {
      expect(ids.has(l.source) && ids.has(l.target), JSON.stringify(l)).toBe(
        true,
      );
    }
  });

  test('rejects a related slug that is not a topic', () => {
    const bad = [{ ...topics[0], related: ['no-such-topic'] }];
    expect(() => topicsToGraph(bad)).toThrow('BAD RELATED LINK');
  });

  test('rejects a pair listed on both sides', () => {
    const bad = topics.map((t) =>
      t.slug === 'harness-engineering'
        ? { ...t, related: ['agents-with-adk'] }
        : t,
    );
    expect(() => topicsToGraph(bad)).toThrow('BAD RELATED LINK');
  });
});

describe('live and coming-soon topics', () => {
  test('only a live topic gets a link to /<slug> (fixture)', () => {
    const nodes = topicsToGraph(withLive).nodes.filter((n) => !n.hub);
    expect(nodes.find((n) => n.id === 'harness-engineering')).toMatchObject({
      live: true,
      href: '/harness-engineering',
    });
    for (const n of nodes.filter((n) => n.id !== 'harness-engineering')) {
      expect(n.href, n.id).toBeUndefined();
    }
  });

  test('in this build only harness-engineering is live and linked', () => {
    expect(
      topicsToGraph(topics)
        .nodes.filter((n) => n.href)
        .map((n) => n.id),
    ).toEqual(['harness-engineering']);
  });

  test('the no-JS list links a live topic and not a coming-soon one (fixture)', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TopicGraph, {
      props: { topics: withLive },
    });
    const anchors = [...html.matchAll(/<a [^>]*href="([^"]+)"/g)].map(
      (m) => m[1],
    );
    expect(anchors).toEqual(['/harness-engineering']);
    expect(html).toContain('>Topics</h2>');
  });

  test('the no-JS list links only the live topic in this build', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TopicGraph);
    const anchors = [...html.matchAll(/<a [^>]*href="([^"]+)"/g)].map(
      (m) => m[1],
    );
    expect(anchors).toEqual(['/harness-engineering']);
  });
});

describe('card and input', () => {
  const graph = topicsToGraph(withLive);
  const live = graph.nodes.find((n) => n.live)!;
  const soon = graph.nodes.find((n) => !n.hub && !n.live)!;

  test('the card shows the title, badge, blurb, and a link only when live', () => {
    expect(cardContent(live)).toEqual({
      title: live.title,
      badge: { text: 'Live', live: true },
      blurb: live.blurb,
      link: { text: 'Read the topic →', href: '/harness-engineering' },
    });
    expect(cardContent(soon)).toEqual({
      title: soon.title,
      badge: { text: 'Coming soon', live: false },
      blurb: soon.blurb,
    });
    expect(CARD_PROMPT).toBe('Pick a topic to see what it covers.');
  });

  test('Enter opens a live topic; Enter or Space selects a coming-soon one', () => {
    expect(keyAction(live, 'Enter')).toEqual({
      navigate: '/harness-engineering',
    });
    expect(keyAction(live, ' ')).toBe('select');
    expect(keyAction(soon, 'Enter')).toBe('select');
    expect(keyAction(soon, ' ')).toBe('select');
    expect(keyAction(soon, 'a')).toBeNull();
  });

  test('a click opens a live topic on desktop; a tap only selects', () => {
    expect(clickAction(live, false)).toEqual({
      navigate: '/harness-engineering',
    });
    expect(clickAction(live, true)).toBe('select');
    expect(clickAction(soon, false)).toBe('select');
  });
});

// The blurbs table: | Topic (`slug`) | Teaser | Full blurb |
function blurbsDoc(): Map<string, { teaser: string; full: string }> {
  const rows = readFileSync(BLURBS_DOC, 'utf8')
    .split('\n')
    .map((line) => line.match(/^\| .*\(`([a-z-]+)`\) \| (.+?) \| (.+?) \|$/))
    .filter((m): m is RegExpMatchArray => m !== null && m[1] !== 'slug'); // skip the header row
  return new Map(rows.map((m) => [m[1], { teaser: m[2], full: m[3] }]));
}

test('topics.ts blurbs match topic-blurbs.md for each topic status', () => {
  const doc = blurbsDoc();
  expect([...doc.keys()].sort()).toEqual(topics.map((t) => t.slug).sort());
  for (const t of topics) {
    const { teaser, full } = doc.get(t.slug)!;
    const usesFull =
      t.status === 'live' || teaser === 'Uses the full blurb from the start.';
    expect(
      t.blurb,
      `BLURB OUT OF SYNC: "${t.slug}"
  Rule: a topic's blurb in src/data/topics.ts is copied from
        docs/content/topic-blurbs.md: the teaser while it is coming soon,
        the full blurb once it is live.
  Fix:  copy the ${usesFull ? 'full blurb' : 'teaser'} from that file into topics.ts.`,
    ).toBe(usesFull ? full : teaser);
  }
});
