// The harness page's graph: six parts, their edges and two hand-placed
// layouts (docs/briefs/harness-engineering.md, *Graph*). Positions are
// percentages of the graph box, so every layout's nodes and edges share one
// coordinate system.

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

/** The centre node: every part connects to it. */
export const hub = { id: 'heuristics', label: 'Heuristics' };

export type Edge = { from: string; to: string };

/** The hub connects to every part. */
export const edges: Edge[] = parts.map((p) => ({ from: hub.id, to: p.id }));

/** Nodes whose label sits above the ring, away from the edge below it. */
export const labelAbove = new Set(['capabilities', 'context']);

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
// percentage positions agree. The hub is in the middle, Part I and Part VI
// either side of it, and the four primitives at the corners.
export const wide: Layout = {
  width: 1000,
  height: 620,
  r: 26,
  hubR: 44,
  boxes: {
    [hub.id]: { x: 50, y: 50 },
    foundations: { x: 11, y: 50 },
    capabilities: { x: 30, y: 16 },
    context: { x: 70, y: 16 },
    constraints: { x: 70, y: 84 },
    feedback: { x: 30, y: 84 },
    discipline: { x: 89, y: 50 },
  },
};

export const phone: Layout = {
  width: 360,
  height: 600,
  r: 20,
  hubR: 40,
  boxes: {
    [hub.id]: { x: 50, y: 50 },
    foundations: { x: 11, y: 50 },
    capabilities: { x: 25, y: 22 },
    context: { x: 75, y: 22 },
    constraints: { x: 75, y: 78 },
    feedback: { x: 25, y: 78 },
    discipline: { x: 89, y: 50 },
  },
};

export type Pt = { x: number; y: number };

export const centre = (layout: Layout, id: string): Pt => ({
  x: (layout.boxes[id].x / 100) * layout.width,
  y: (layout.boxes[id].y / 100) * layout.height,
});

/**
 * SVG path for an edge, from one node centre to the other. Nodes are drawn
 * over the edges, so each end is hidden under its ring.
 */
export function edgeD(a: Pt, b: Pt): string {
  const f = (n: number) => Math.round(n * 10) / 10;
  return `M${f(a.x)} ${f(a.y)} L${f(b.x)} ${f(b.y)}`;
}

/** The graph as readable sentences, for the text equivalent. */
export function edgeSentence(e: Edge): string {
  const name = (id: string) => [...parts, hub].find((p) => p.id === id)!.label;
  return `${name(e.from)} connects to ${name(e.to)}.`;
}
