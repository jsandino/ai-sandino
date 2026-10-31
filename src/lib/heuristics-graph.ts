// The Heuristics page's graph: a hub and a ring of twelve nodes, in a wide
// and a phone layout (docs/briefs/harness-engineering.md, *Heuristics*).
// Nodes sit on an ellipse, clockwise from the top in the guide's order, with
// each label pointing away from the hub so no edge runs through one.

import type { Pt } from './hub-graph';

export const HUB_ID = 'heuristics';
export const HUB_LABEL = 'Heuristics';

export type Layout = {
  width: number;
  height: number;
  /** Node, hub and tap-target radii, in the layout's units. */
  r: number;
  hubR: number;
  hit: number;
  /** The ring's radii. */
  rx: number;
  ry: number;
  fontSize: number;
  lineHeight: number;
  /** Longest label line, in characters, before it wraps. */
  wrap: number;
};

export const wide: Layout = {
  width: 1000,
  height: 640,
  r: 20,
  hubR: 44,
  hit: 20,
  rx: 250,
  ry: 215,
  fontSize: 13,
  lineHeight: 15,
  wrap: 40,
};

export const phone: Layout = {
  width: 360,
  height: 660,
  r: 9,
  hubR: 36,
  hit: 20,
  rx: 52,
  ry: 270,
  fontSize: 11,
  lineHeight: 13,
  wrap: 16,
};

export const nodeId = (n: number) => `h${n}`;

export const centre = (l: Layout): Pt => ({ x: l.width / 2, y: l.height / 2 });

/** Where node `i` of `count` sits: i = 0 at the top, then clockwise. */
export function ringPoint(l: Layout, i: number, count = 12): Pt {
  const a = -Math.PI / 2 + (2 * Math.PI * i) / count;
  const c = centre(l);
  return { x: c.x + l.rx * Math.cos(a), y: c.y + l.ry * Math.sin(a) };
}

/** Greedy word wrap: lines of at most `max` characters (a long word stays whole). */
export function wrapWords(text: string, max: number): string[] {
  const lines: string[] = [];
  for (const word of text.split(' ')) {
    const last = lines[lines.length - 1];
    if (last !== undefined && last.length + 1 + word.length <= max)
      lines[lines.length - 1] = `${last} ${word}`;
    else lines.push(word);
  }
  return lines;
}

export type Label = {
  lines: string[];
  anchor: 'start' | 'middle' | 'end';
  /** Offsets from the node centre: x of every line, y of the first baseline. */
  x: number;
  y: number;
};

/** The label for node `i`: beside the node on the sides, above or below at the top and bottom. */
export function labelFor(
  l: Layout,
  i: number,
  name: string,
  count = 12,
): Label {
  const a = -Math.PI / 2 + (2 * Math.PI * i) / count;
  const lines = wrapWords(name, l.wrap);
  const pad = l.r + 8;
  const c = Math.cos(a);
  if (Math.abs(c) < 0.25) {
    const above = Math.sin(a) < 0;
    return {
      lines,
      anchor: 'middle',
      x: 0,
      y: above
        ? -pad - l.lineHeight * (lines.length - 1)
        : l.r + l.fontSize + 5,
    };
  }
  return {
    lines,
    anchor: c > 0 ? 'start' : 'end',
    x: c > 0 ? pad : -pad,
    // Centre the block on the node: the 0.35em lowers a baseline to the middle.
    y: l.fontSize * 0.35 - (l.lineHeight * (lines.length - 1)) / 2,
  };
}
