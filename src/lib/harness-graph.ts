// The harness page's graph: six parts, their edges and two hand-placed
// layouts (docs/briefs/harness-engineering.md, *Graph*). Positions are
// percentages of the graph box, so the HTML nodes and the SVG edges share
// one coordinate system.

export type Colour =
  'neutral' | 'context' | 'constraints' | 'capabilities' | 'feedback';

export type Part = {
  id: string;
  numeral: string;
  label: string;
  summary: string;
  colour: Colour;
};

export const parts: Part[] = [
  {
    id: 'foundations',
    numeral: 'I',
    label: 'Foundations',
    summary:
      'An agent without a harness is a guess generator. An agent with a harness is a force multiplier.',
    colour: 'neutral',
  },
  {
    id: 'context',
    numeral: 'II',
    label: 'Context architecture',
    summary:
      "Context is the substrate of every agent task. If it's wrong, nothing downstream can recover.",
    colour: 'context',
  },
  {
    id: 'constraints',
    numeral: 'III',
    label: 'Mechanical constraints',
    summary:
      "If a rule matters, make it mechanical. Prose drifts, checks don't.",
    colour: 'constraints',
  },
  {
    id: 'capabilities',
    numeral: 'IV',
    label: 'Agent capabilities',
    summary:
      'Skills are for workflows; docs are for knowledge. The wrong mechanism is worse than no mechanism.',
    colour: 'capabilities',
  },
  {
    id: 'feedback',
    numeral: 'V',
    label: 'Feedback loops',
    summary: "The harness fails where you aren't looking.",
    colour: 'feedback',
  },
  {
    id: 'discipline',
    numeral: 'VI',
    label: 'Operating discipline',
    summary: 'The repo outlives the session, the model, and the conversation.',
    colour: 'neutral',
  },
];

const PRIMITIVES = ['capabilities', 'context', 'constraints', 'feedback'];

export type Edge = {
  from: string;
  to: string;
  directed: boolean;
  colour: Colour;
};

const colourOf = (id: string): Colour => parts.find((p) => p.id === id)!.colour;

export const edges: Edge[] = [
  ...PRIMITIVES.map((id) => ({
    from: 'foundations',
    to: id,
    directed: false,
    colour: colourOf(id),
  })),
  ...PRIMITIVES.map((id) => ({
    from: id,
    to: 'discipline',
    directed: false,
    colour: colourOf(id),
  })),
  // capabilities → context → constraints → feedback loops
  ...PRIMITIVES.slice(0, -1).map((id, i) => ({
    from: id,
    to: PRIMITIVES[i + 1],
    directed: true,
    colour: colourOf(id),
  })),
];

type Box = { x: number; y: number }; // node centre, % of the graph box
export type Layout = {
  width: number;
  height: number;
  /** Node radius, in the layout's units. */
  r: number;
  boxes: Record<string, Box>;
};

// Units are 1 per px at the layout's reference width, so the viewBox and the
// percentage positions agree.
export const wide: Layout = {
  width: 1000,
  height: 620,
  r: 26,
  boxes: {
    foundations: { x: 14, y: 50 },
    capabilities: { x: 50, y: 11.5 },
    context: { x: 50, y: 37.2 },
    constraints: { x: 50, y: 62.8 },
    feedback: { x: 50, y: 88.5 },
    discipline: { x: 86, y: 50 },
  },
};

export const phone: Layout = {
  width: 360,
  height: 600,
  r: 20,
  boxes: {
    foundations: { x: 50, y: 12 },
    capabilities: { x: 12.5, y: 50 },
    context: { x: 37.5, y: 50 },
    constraints: { x: 62.5, y: 50 },
    feedback: { x: 87.5, y: 50 },
    discipline: { x: 50, y: 82 },
  },
};

export type Pt = { x: number; y: number };

export const centre = (layout: Layout, id: string): Pt => ({
  x: (layout.boxes[id].x / 100) * layout.width,
  y: (layout.boxes[id].y / 100) * layout.height,
});

/**
 * SVG path for an edge, from one node centre to the other. Nodes are drawn
 * over the edges, so an undirected edge ends hidden under its ring; a
 * directed one stops at the target's ring so its arrowhead shows.
 */
export function edgeD(a: Pt, b: Pt, r: number, directed: boolean): string {
  const f = (n: number) => Math.round(n * 10) / 10;
  let end = b;
  if (directed) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const k = (Math.hypot(dx, dy) - r) / Math.hypot(dx, dy);
    end = { x: a.x + dx * k, y: a.y + dy * k };
  }
  return `M${f(a.x)} ${f(a.y)} L${f(end.x)} ${f(end.y)}`;
}

/** The graph as readable sentences, for the text equivalent. */
export function edgeSentence(e: Edge): string {
  const name = (id: string) => parts.find((p) => p.id === id)!.label;
  return e.directed
    ? `${name(e.from)} leads to ${name(e.to)}.`
    : `${name(e.from)} connects to ${name(e.to)}.`;
}
