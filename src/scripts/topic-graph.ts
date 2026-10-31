// Draws the landing topic graph into a [data-graph-root] element
// (docs/briefs/landing.md, Decided #2–#5; motion in docs/design-system.md).
// Built to docs/design/landing-hero.html: the layout is computed off-screen
// to rest, then each topic glides in from the centre; at rest the graph
// breathes and the hub sparks. Under reduced motion it appears settled and
// nothing moves.

import { drag } from 'd3-drag';
import { easeCubicInOut, easeCubicOut } from 'd3-ease';
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from 'd3-force';
import { select } from 'd3-selection';
import { timer, type Timer } from 'd3-timer';
import 'd3-transition';
import {
  CARD_PROMPT,
  cardContent,
  clickAction,
  keyAction,
  type Action,
  type Graph,
  type GraphLink,
  type GraphNode,
} from '../lib/topic-graph';
import { startSpark } from '../lib/spark';

// Layout settings per frame. The phone runs the same force layout in a
// portrait frame at real size, so labels stay readable.
type Frame = {
  tap: boolean;
  W: number;
  H: number;
  spoke: number;
  rel: number;
  charge: number;
  collide: number;
  fx: number;
  fy: number;
};
const DESKTOP: Frame = {
  tap: false,
  W: 640,
  H: 440,
  spoke: 150,
  rel: 200,
  charge: -500,
  collide: 60,
  fx: 0.05,
  fy: 0.08,
};
const PHONE: Frame = {
  tap: true,
  W: 360,
  H: 560,
  spoke: 190,
  rel: 230,
  charge: -450,
  collide: 70,
  fx: 0.4,
  fy: 0.015,
};

const NARROW = '(max-width: 639.98px)';
const REDUCE = '(prefers-reduced-motion: reduce)';
const GLIDE_MS = 1600;
const STAGGER = 260;
const FOCUS_SCALE = 1.15;
const HOVER_MS = 150; // rest on a node this long to replace the card's topic
const MARGIN = 4; // px kept clear between a node's marks and the frame edge

const LIVE_TAG = 'live';

type Node = GraphNode &
  SimulationNodeDatum & {
    x: number;
    y: number;
    tx: number;
    ty: number;
    phase: number;
    // Extent of the node's marks (ring and labels) around its centre.
    box: { left: number; right: number; top: number; bottom: number };
  };
type Link = Omit<GraphLink, 'source' | 'target'> &
  SimulationLinkDatum<Node> & { source: Node; target: Node };

const radius = (d: GraphNode) => (d.hub ? 22 : d.live ? 26 : 20);

function fillCard(card: HTMLElement, d: GraphNode | null) {
  // Already showing this node: keep the DOM, so a link being tapped or
  // focused is never swapped out from under the user.
  if (card.dataset.node === (d?.id ?? '')) return;
  card.dataset.node = d?.id ?? '';
  const el = <K extends keyof HTMLElementTagNameMap>(
    tag: K,
    cls: string,
    text: string,
  ) => {
    const e = document.createElement(tag);
    e.className = cls;
    e.textContent = text;
    return e;
  };
  card.replaceChildren();
  card.classList.toggle('empty', !d);
  if (!d) {
    card.append(el('p', 'card-prompt', CARD_PROMPT));
    return;
  }
  const c = cardContent(d);
  const head = el('div', 'card-head', '');
  head.append(
    el('h3', '', c.title),
    el('span', c.badge.live ? 'badge live' : 'badge', c.badge.text),
  );
  card.append(head, el('p', 'card-blurb', c.blurb));
  if (c.link) {
    const a = el('a', 'card-link', c.link.text);
    a.href = c.link.href;
    card.append(a);
  }
}

export function mountTopicGraph(root: HTMLElement) {
  const graph = JSON.parse(root.dataset.graph ?? '') as Graph;
  const svgEl = root.querySelector('svg')!;
  const card = root.querySelector<HTMLElement>('[data-card]')!;
  const section = root.closest('section')!;

  // Enhance: the list stays for no-JS visitors; its heading stays for
  // screen readers.
  section.querySelector<HTMLElement>('[data-topic-list] ul')!.hidden = true;
  section.querySelector('h2')!.classList.add('sr-only');
  root.hidden = false;

  let stop = () => {};
  const narrow = matchMedia(NARROW);
  const render = () => {
    stop();
    stop = draw(svgEl, card, graph, narrow.matches ? PHONE : DESKTOP);
  };
  render();
  narrow.addEventListener('change', render);
}

/** Draws the graph in one frame; returns a function that stops it. */
function draw(
  svgEl: SVGSVGElement,
  card: HTMLElement,
  graph: Graph,
  o: Frame,
): () => void {
  const reduce = matchMedia(REDUCE).matches;
  const { W, H } = o;
  const CX = W / 2;
  const CY = H / 2;
  const ms = (t: number) => (reduce ? 0 : t);
  const timers: Timer[] = [];
  let stopSpark = () => {};

  const svg = select(svgEl);
  svg.selectAll('*').remove();
  svg.attr('viewBox', `0 0 ${W} ${H}`);

  const nodes = graph.nodes.map((n) => ({ ...n }) as Node);
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const links = graph.links.map((l): Link => ({
    ...l,
    source: byId.get(l.source)!,
    target: byId.get(l.target)!,
  }));

  const link = svg
    .append('g')
    .attr('aria-hidden', 'true')
    .selectAll<SVGLineElement, Link>('line')
    .data(links)
    .join('line')
    .attr('class', (d) => `link ${d.kind}`);
  const node = svg
    .append('g')
    .selectAll<SVGGElement, Node>('g')
    .data(nodes)
    .join('g')
    .attr('class', (d) => `node${d.live ? ' live' : ''}${d.hub ? ' hub' : ''}`)
    .attr('data-id', (d) => d.id);
  const body = node.append('g').attr('class', 'body');
  body.append('circle').attr('class', 'ring').attr('r', radius);
  body
    .filter((d) => d.live)
    .append('circle')
    .attr('class', 'core')
    .attr('r', 6);
  body
    .filter((d) => d.hub)
    .append('text')
    .attr('class', 'hub-label')
    .attr('dy', '0.35em')
    .text((d) => d.label);
  body
    .filter((d) => !d.hub)
    .append('text')
    .attr('class', 'label')
    .attr('y', (d) => radius(d) + 18)
    .text((d) => d.label);
  body
    .filter((d) => d.live)
    .append('text')
    .attr('class', 'tag')
    .attr('y', (d) => radius(d) + 33)
    .text(LIVE_TAG);

  // Measure each node's marks at their largest (focused) size, so the
  // frame can keep every node and label inside it.
  body.each(function (d) {
    const b = this.getBBox();
    d.box = {
      left: -b.x * FOCUS_SCALE + MARGIN,
      right: (b.x + b.width) * FOCUS_SCALE + MARGIN,
      top: -b.y * FOCUS_SCALE + MARGIN,
      bottom: (b.y + b.height) * FOCUS_SCALE + MARGIN,
    };
  });
  const clamp = (n: Node) => {
    n.x = Math.max(n.box.left, Math.min(W - n.box.right, n.x));
    n.y = Math.max(n.box.top, Math.min(H - n.box.bottom, n.y));
  };

  const place = () => {
    nodes.forEach(clamp);
    link
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y);
    node.attr('transform', (d) => `translate(${d.x},${d.y})`);
  };

  // Interaction: hover or focus previews; click, tap or keys act. The card
  // keeps its topic until the pointer or focus leaves the graph and card
  // together, so its link can be reached.
  const touches = (l: Link, d: Node) => l.source === d || l.target === d;
  let selected: Node | null = null;
  let hoverTimeout: ReturnType<typeof setTimeout> | undefined;
  const highlight = (d: Node) => {
    const rel = new Set(
      links
        .filter((l) => l.kind === 'related' && touches(l, d))
        .flatMap((l) => [l.source, l.target]),
    );
    node.classed('related-on', (n) => n !== d && rel.has(n));
    node
      .transition()
      .duration(ms(250))
      .style('opacity', (n) => (n === d || n.hub || rel.has(n) ? 1 : 0.3));
    body
      .transition()
      .duration(ms(250))
      .attr('transform', (n) =>
        n === d ? `scale(${FOCUS_SCALE})` : 'scale(1)',
      );
    link
      .transition()
      .duration(ms(250))
      .style('stroke', (l) =>
        touches(l, d) ? 'var(--color-accent-strong)' : null,
      )
      .style('opacity', (l) => (touches(l, d) ? 1 : 0.2));
    fillCard(card, d);
  };
  const clear = () => {
    node.classed('related-on', false);
    node.transition().duration(ms(300)).style('opacity', 1);
    body.transition().duration(ms(300)).attr('transform', 'scale(1)');
    link
      .transition()
      .duration(ms(300))
      .style('stroke', null)
      .style('opacity', null);
    fillCard(card, null);
  };
  const restore = () => (selected ? highlight(selected) : clear());
  const act = (action: Action, d: Node) => {
    if (!action) return;
    if (action !== 'select') {
      location.assign(action.navigate);
      return;
    }
    selected = selected === d ? null : d;
    restore();
  };
  fillCard(card, null);

  node
    .filter((d) => !d.hub)
    .attr('tabindex', 0)
    .attr('role', (d) => (d.href ? 'link' : 'button'))
    .on('mouseenter', (_e, d) => {
      if (selected) return;
      // With a topic already on the card, a pointer sweeping across other
      // nodes on its way to the card's link must not replace it.
      clearTimeout(hoverTimeout);
      if (card.dataset.node) hoverTimeout = setTimeout(highlight, HOVER_MS, d);
      else highlight(d);
    })
    .on('mouseleave', () => clearTimeout(hoverTimeout))
    .on('focus', (_e, d) => highlight(d))
    .on('click', (_e, d) => act(clickAction(d, o.tap), d))
    .on('keydown', (e: KeyboardEvent, d) => {
      const action = keyAction(d, e.key);
      if (!action) return;
      e.preventDefault();
      act(action, d);
    });

  const region = svgEl.closest<HTMLElement>('[data-graph-root]')!;
  const onFocusOut = (e: FocusEvent) => {
    const to = e.relatedTarget;
    if (!(to instanceof Element && region.contains(to))) restore();
  };
  region.addEventListener('mouseleave', restore);
  region.addEventListener('focusout', onFocusOut);

  // Layout computed off-screen, to rest. Related links pull gently.
  nodes.forEach((n, i) => {
    const a = (i / nodes.length) * Math.PI * 2;
    n.x = CX + Math.cos(a) * 40;
    n.y = CY + Math.sin(a) * 40;
    n.phase = (i * 2.399) % (Math.PI * 2);
  });
  const sim = forceSimulation(nodes)
    .force(
      'link',
      forceLink<Node, Link>(links)
        .distance((l) => (l.kind === 'spoke' ? o.spoke : o.rel))
        .strength((l) => (l.kind === 'spoke' ? 1 : 0.15)),
    )
    .force('charge', forceManyBody().strength(o.charge))
    .force('center', forceCenter(CX, CY))
    .force('collide', forceCollide(o.collide))
    .force('x', forceX(CX).strength(o.fx))
    .force('y', forceY(CY).strength(o.fy))
    .stop();
  for (let i = 0; i < 500; i++) sim.tick();
  nodes.forEach((n) => {
    clamp(n);
    n.tx = n.x;
    n.ty = n.y;
    n.vx = 0;
    n.vy = 0;
  });

  const stopAll = () => {
    clearTimeout(hoverTimeout);
    region.removeEventListener('mouseleave', restore);
    region.removeEventListener('focusout', onFocusOut);
    sim.stop();
    timers.forEach((t) => t.stop());
    stopSpark();
    svg.selectAll('*').interrupt();
  };

  if (reduce) {
    place();
    return stopAll;
  }

  const hubBody = body.filter((d) => d.hub);
  const hubR = radius(nodes.find((n) => n.hub)!) + 4;

  // At rest: breathe gently (≤ ~2px), and let nodes be dragged.
  const breathe = () => {
    const t = performance.now() / 1000;
    for (const n of nodes) {
      n.vx! += Math.cos(t * 0.6 + n.phase) * 0.01;
      n.vy! += Math.sin(t * 0.8 + n.phase) * 0.01;
    }
  };
  const goLive = () => {
    stopSpark = startSpark(hubBody.node()!, hubR, 600);
    sim
      .force('breathe', breathe)
      .velocityDecay(0.6)
      .alpha(0.02)
      .alphaTarget(0.02)
      .on('tick', place)
      .restart();
    node.call(
      drag<SVGGElement, Node>()
        .on('start', (e, d) => {
          if (!e.active) sim.alphaTarget(0.15).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (e, d) => {
          d.fx = e.x;
          d.fy = e.y;
        })
        .on('end', (e, d) => {
          if (!e.active) sim.alphaTarget(0.02);
          d.fx = null;
          d.fy = null;
        }),
    );
  };

  // Entrance: glide from the centre (ease-out), fade/grow/sharpen, then
  // spokes draw in, then related links; a live node ripples as it lands.
  nodes.forEach((n) => {
    n.x = CX;
    n.y = CY;
  });
  place();
  body
    .attr('transform', 'scale(.3)')
    .style('opacity', 0)
    .style('filter', 'blur(8px)')
    .transition()
    .delay((_d, i) => 150 + i * STAGGER)
    .duration(1300)
    .ease(easeCubicOut)
    .attr('transform', 'scale(1)')
    .style('opacity', 1)
    .style('filter', 'blur(0px)')
    .on('end', function () {
      this.style.removeProperty('filter');
    });
  link
    .attr('stroke-dasharray', 400)
    .attr('stroke-dashoffset', 400)
    .transition()
    .delay((d, i) => (d.kind === 'spoke' ? 650 + i * STAGGER : 2300 + i * 120))
    .duration(1100)
    .ease(easeCubicInOut)
    .attr('stroke-dashoffset', 0)
    .on('end', function () {
      select(this)
        .attr('stroke-dasharray', null)
        .attr('stroke-dashoffset', null);
    });
  node
    .filter((d) => d.live)
    .each(function (d) {
      const i = nodes.indexOf(d);
      select(this)
        .insert('circle', ':first-child')
        .attr('class', 'ripple')
        .attr('aria-hidden', 'true')
        .attr('r', radius(d))
        .style('opacity', 0)
        .transition()
        .delay(150 + i * STAGGER + 900)
        .duration(0)
        .style('opacity', 0.8)
        .transition()
        .duration(1400)
        .ease(easeCubicOut)
        .attr('r', radius(d) * 3)
        .style('opacity', 0)
        .remove();
    });
  const glide = timer((elapsed) => {
    let done = true;
    nodes.forEach((n, i) => {
      const t = Math.min(
        1,
        Math.max(0, (elapsed - 150 - i * STAGGER) / GLIDE_MS),
      );
      if (t < 1) done = false;
      const k = easeCubicOut(t);
      n.x = CX + (n.tx - CX) * k;
      n.y = CY + (n.ty - CY) * k;
    });
    place();
    if (done) {
      glide.stop();
      goLive();
    }
  });
  timers.push(glide);

  return stopAll;
}
