// The harness page's graph: six parts, their edges and two hand-placed
// layouts (docs/briefs/harness-engineering.md, *Graph*). Positions are
// percentages of the graph box, so every layout's nodes and edges share one
// coordinate system.

import type { Pt } from './hub-graph';

export type Part = {
  id: string;
  numeral: string;
  label: string;
  summary: string;
};

export const parts: Part[] = [
  {
    id: 'foundations',
    numeral: 'I',
    label: 'Foundations',
    summary:
      'An agent without a harness is a guess generator. An agent with a harness is a force multiplier.',
  },
  {
    id: 'context',
    numeral: 'II',
    label: 'Context Architecture',
    summary:
      "Context is the substrate of every agent task. If it's wrong, nothing downstream can recover.",
  },
  {
    id: 'constraints',
    numeral: 'III',
    label: 'Mechanical Constraints',
    summary:
      "If a rule matters, make it mechanical. Prose drifts, checks don't.",
  },
  {
    id: 'capabilities',
    numeral: 'IV',
    label: 'Agent Capabilities',
    summary:
      'Skills are for workflows; docs are for knowledge. The wrong mechanism is worse than no mechanism.',
  },
  {
    id: 'feedback',
    numeral: 'V',
    label: 'Feedback Loops',
    summary: "The harness fails where you aren't looking.",
  },
  {
    id: 'discipline',
    numeral: 'VI',
    label: 'Operating Discipline',
    summary: 'The repo outlives the session, the model, and the conversation.',
  },
];

export const CARD_PROMPT = 'Pick a part to see what it covers.';

/** The centre node: every part connects to it. */
export const hub = { id: 'heuristics', label: 'Heuristics' };

export type Edge = { from: string; to: string };

/** The hub connects to every part. */
export const edges: Edge[] = parts.map((p) => ({ from: hub.id, to: p.id }));

/** Nodes whose label sits above the ring, away from the edge below it. */
export const labelAbove = new Set(['foundations', 'context']);

type Box = { x: number; y: number }; // node centre, % of the graph box
export type Layout = {
  width: number;
  height: number;
  /** Radius of a part's node, and of the hub's, in the layout's units. */
  r: number;
  hubR: number;
  boxes: Record<string, Box>;
};

// Units are 1 per px at the layout's reference width, so the viewBox and the
// percentage positions agree. The hub is in the middle and the parts go round
// it clockwise from the top left: I, II, III, IV, V, VI.
export const wide: Layout = {
  width: 1000,
  height: 346,
  r: 26,
  hubR: 44,
  boxes: {
    [hub.id]: { x: 50, y: 50 },
    foundations: { x: 41, y: 25.7 },
    capabilities: { x: 59, y: 74.3 },
    context: { x: 59, y: 25.7 },
    constraints: { x: 65, y: 50 },
    feedback: { x: 41, y: 74.3 },
    discipline: { x: 35, y: 50 },
  },
};

export const phone: Layout = {
  width: 360,
  height: 340,
  r: 20,
  hubR: 40,
  boxes: {
    [hub.id]: { x: 50, y: 50 },
    foundations: { x: 37.5, y: 25.3 },
    capabilities: { x: 62.5, y: 74.7 },
    context: { x: 62.5, y: 25.3 },
    constraints: { x: 73.6, y: 50 },
    feedback: { x: 37.5, y: 74.7 },
    discipline: { x: 26.4, y: 50 },
  },
};

export const centre = (layout: Layout, id: string): Pt => ({
  x: (layout.boxes[id].x / 100) * layout.width,
  y: (layout.boxes[id].y / 100) * layout.height,
});

/** The graph as readable sentences, for the text equivalent. */
export function edgeSentence(e: Edge): string {
  const name = (id: string) => [...parts, hub].find((p) => p.id === id)!.label;
  return `${name(e.from)} connects to ${name(e.to)}.`;
}
