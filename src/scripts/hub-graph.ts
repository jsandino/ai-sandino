// Motion and hover for the hub-and-spoke graphs (Harness Engineering and
// Heuristics pages), in the landing topic graph's paradigm
// (docs/design-system.md#motion): once the graph scrolls into view
// each node glides out from the centre (fading, growing, sharpening), the
// edges draw in following the nodes, and at rest the nodes breathe by a
// pixel or two, and the hub sparks. Hovering a node dims the rest and
// lights up its edges, as on the landing graph. Under reduced motion nothing
// is hidden or moved, and the hub does not spark.

import { edgeD, type Pt } from '../lib/hub-graph';
import { startSpark } from '../lib/spark';

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
    }),
  );
  const hubBody = svg.querySelector<SVGGElement>('.hub .body')!;

  const frame = (elapsed: number, now: number) => {
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
      e.el.setAttribute('d', edgeD(e.from.pos, e.to.pos));
      e.el.style.strokeDashoffset = t < 1 ? String(1 - easeInOut(t)) : '0';
      e.el.style.strokeDasharray = t < 1 ? '1' : 'none';
    });
  };
  const sparkAfter = DELAY + nodes.size * STAGGER + GLIDE_MS;
  const spark = () =>
    startSpark(hubBody, Number(svg.dataset.hubR) + 4, sparkAfter);
  return { frame, spark };
}

/**
 * Hover or tap a node: dim the rest, light up its edges, grow it. A node
 * with tabindex also previews on focus, selects on Enter or Space, and
 * Escape clears the selection. `onShow` hears which node is lit (null for
 * none), so a page can fill a card.
 */
export function wireHubHover(
  root: HTMLElement,
  onShow?: (id: string | null) => void,
): void {
  const svgs = [...root.querySelectorAll<SVGSVGElement>('svg.hub-graph')];
  let selected: string | null = null;

  const show = (id: string | null) => {
    svgs.forEach((svg) => {
      const edges = [...svg.querySelectorAll<SVGPathElement>('.edge')];
      const touching = (e: SVGPathElement) =>
        e.dataset.from === id || e.dataset.to === id;
      svg.querySelectorAll<SVGGElement>('.node').forEach((n) => {
        const mine = n.dataset.node;
        n.classList.toggle('on', mine === id);
        n.classList.toggle(
          'dim',
          id !== null && mine !== id && !n.classList.contains('hub'),
        );
      });
      edges.forEach((e) => {
        e.classList.toggle('hl', id !== null && touching(e));
        e.classList.toggle('dim', id !== null && !touching(e));
      });
    });
    onShow?.(id);
  };
  const restore = () => show(selected);
  const toggle = (id: string) => {
    selected = selected === id ? null : id;
    restore();
  };

  svgs.forEach((svg) => {
    svg.querySelectorAll<SVGGElement>('.node:not(.hub)').forEach((n) => {
      const id = n.dataset.node!;
      n.addEventListener('mouseenter', () => {
        if (!selected) show(id);
      });
      n.addEventListener('click', () => toggle(id));
      n.addEventListener('focus', () => show(id));
      n.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle(id);
        } else if (e.key === 'Escape') {
          selected = null;
          restore();
        }
      });
    });
  });
  root.addEventListener('mouseleave', restore);
  root.addEventListener('focusout', (e) => {
    if (!(e.relatedTarget instanceof Element && root.contains(e.relatedTarget)))
      restore();
  });
}

export function animateHubGraph(root: HTMLElement): void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const rigs = [...root.querySelectorAll<SVGSVGElement>('svg.hub-graph')].map(
    rig,
  );
  root.dataset.anim = 'ready';

  const play = () => {
    const t0 = performance.now();
    rigs.forEach((r) => r.spark());
    const loop = (now: number) => {
      rigs.forEach((r) => r.frame(now - t0, now));
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
