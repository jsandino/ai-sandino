// Geometry shared by the hub-and-spoke graphs (Harness Engineering and
// Heuristics pages).

export type Pt = { x: number; y: number };

/**
 * SVG path for an edge, from one node centre to the other. Nodes are drawn
 * over the edges, so each end is hidden under its ring.
 */
export function edgeD(a: Pt, b: Pt): string {
  const f = (n: number) => Math.round(n * 10) / 10;
  return `M${f(a.x)} ${f(a.y)} L${f(b.x)} ${f(b.y)}`;
}
