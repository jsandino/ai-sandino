// Motion for the harness page's graph, in the landing topic graph's
// paradigm (docs/design-system.md#motion): once the graph scrolls into view
// each node glides out from the centre (fading, growing, sharpening), the
// edges draw in following the nodes, and at rest the nodes breathe by a
// pixel or two. Under reduced motion nothing is hidden or moved.

import { edgeD, type Pt } from '../lib/harness-graph';

const GLIDE_MS = 1600;
const STAGGER = 160;
const DELAY = 150;
const EDGE_START = 650;
const EDGE_STAGGER = 110;
const EDGE_MS = 1100;
const BREATHE = 1.5; // px

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;

type NodeRig = {
  g: SVGGElement;
  body: SVGGElement;
  rest: Pt;
  phase: number;
  pos: Pt;
};

function rig(svg: SVGSVGElement) {
  const r = Number(svg.dataset.r);
  const [, , w, h] = svg.getAttribute('viewBox')!.split(' ').map(Number);
  const middle = { x: w / 2, y: h / 2 };
  const nodes = new Map<string, NodeRig>();
  [...svg.querySelectorAll<SVGGElement>('.node')].forEach((g, i) => {
    const rest = { x: Number(g.dataset.x), y: Number(g.dataset.y) };
    nodes.set(g.dataset.node!, {
      g,
      body: g.querySelector<SVGGElement>('.body')!,
      rest,
      phase: (i * 2.399) % (Math.PI * 2),
      pos: rest,
    });
  });
  const edges = [...svg.querySelectorAll<SVGPathElement>('.edge')].map(
    (el) => ({
      el,
      from: nodes.get(el.dataset.from!)!,
      to: nodes.get(el.dataset.to!)!,
      directed: el.hasAttribute('data-directed'),
    }),
  );
  const markers = [...svg.querySelectorAll<SVGMarkerElement>('marker')];
  const edgesEnd = EDGE_START + edges.length * EDGE_STAGGER + EDGE_MS;

  return (elapsed: number, now: number) => {
    [...nodes.values()].forEach((n, i) => {
      const t = clamp01((elapsed - DELAY - i * STAGGER) / GLIDE_MS);
      const k = easeOut(t);
      const sway = k * BREATHE;
      n.pos = {
        x:
          middle.x +
          (n.rest.x - middle.x) * k +
          Math.cos(now * 0.0006 + n.phase) * sway,
        y:
          middle.y +
          (n.rest.y - middle.y) * k +
          Math.sin(now * 0.0008 + n.phase) * sway,
      };
      n.g.setAttribute('transform', `translate(${n.pos.x} ${n.pos.y})`);
      n.body.setAttribute('transform', `scale(${0.3 + 0.7 * k})`);
      n.body.style.opacity = String(k);
      n.body.style.filter = t < 1 ? `blur(${8 * (1 - k)}px)` : '';
    });
    edges.forEach((e, i) => {
      const t = clamp01((elapsed - EDGE_START - i * EDGE_STAGGER) / EDGE_MS);
      e.el.setAttribute('d', edgeD(e.from.pos, e.to.pos, r, e.directed));
      e.el.style.strokeDashoffset = t < 1 ? String(1 - easeInOut(t)) : '0';
      e.el.style.strokeDasharray = t < 1 ? '1' : 'none';
    });
    const m = clamp01((elapsed - edgesEnd) / 400);
    markers.forEach((el) => (el.style.opacity = String(m)));
  };
}

export function mountHarnessGraph(root: HTMLElement): void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const frames = [...root.querySelectorAll<SVGSVGElement>('svg.graph')].map(
    rig,
  );
  root.dataset.anim = 'ready';

  const play = () => {
    const t0 = performance.now();
    const loop = (now: number) => {
      frames.forEach((f) => f(now - t0, now));
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  };

  const seen = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      seen.disconnect();
      play();
    },
    { threshold: 0.25 },
  );
  seen.observe(root);
}
