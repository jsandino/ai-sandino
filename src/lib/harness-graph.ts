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

type Box = { x: number; y: number; w: number; h: number }; // % of the graph box
export type Layout = {
  width: number;
  height: number;
  boxes: Record<string, Box>;
};

// Units are 1 per px at the layout's reference width, so the viewBox and the
// percentage positions agree.
export const wide: Layout = {
  width: 1000,
  height: 620,
  boxes: {
    foundations: { x: 14, y: 50, w: 26, h: 24 },
    capabilities: { x: 50, y: 11.5, w: 26, h: 22.5 },
    context: { x: 50, y: 37.2, w: 26, h: 22.5 },
    constraints: { x: 50, y: 62.8, w: 26, h: 22.5 },
    feedback: { x: 50, y: 88.5, w: 26, h: 22.5 },
    discipline: { x: 86, y: 50, w: 26, h: 24 },
  },
};

export const phone: Layout = {
  width: 360,
  height: 600,
  boxes: {
    foundations: { x: 50, y: 14, w: 80, h: 26 },
    capabilities: { x: 12.5, y: 50, w: 20, h: 26 },
    context: { x: 37.5, y: 50, w: 20, h: 26 },
    constraints: { x: 62.5, y: 50, w: 20, h: 26 },
    feedback: { x: 87.5, y: 50, w: 20, h: 26 },
    discipline: { x: 50, y: 86, w: 80, h: 26 },
  },
};

type Pt = { x: number; y: number };

/** Where a ray from the box centre towards `to` leaves the box. */
function exit(layout: Layout, id: string, to: Pt): Pt {
  const b = layout.boxes[id];
  const cx = (b.x / 100) * layout.width;
  const cy = (b.y / 100) * layout.height;
  const hw = (b.w / 200) * layout.width;
  const hh = (b.h / 200) * layout.height;
  const dx = to.x - cx;
  const dy = to.y - cy;
  const k = Math.min(
    dx === 0 ? Infinity : hw / Math.abs(dx),
    dy === 0 ? Infinity : hh / Math.abs(dy),
  );
  return { x: cx + dx * k, y: cy + dy * k };
}

const centre = (layout: Layout, id: string): Pt => ({
  x: (layout.boxes[id].x / 100) * layout.width,
  y: (layout.boxes[id].y / 100) * layout.height,
});

/** SVG path for an edge, running between the two boxes' borders. */
export function edgePath(layout: Layout, e: Edge): string {
  const a = exit(layout, e.from, centre(layout, e.to));
  const b = exit(layout, e.to, centre(layout, e.from));
  const f = (n: number) => Math.round(n * 10) / 10;
  return `M${f(a.x)} ${f(a.y)} L${f(b.x)} ${f(b.y)}`;
}

/** The graph as readable sentences, for the text equivalent. */
export function edgeSentence(e: Edge): string {
  const name = (id: string) => parts.find((p) => p.id === id)!.label;
  return e.directed
    ? `${name(e.from)} leads to ${name(e.to)}.`
    : `${name(e.from)} connects to ${name(e.to)}.`;
}
