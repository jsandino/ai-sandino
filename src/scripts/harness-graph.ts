// Entrance for the harness page's graph (docs/design-system.md#motion): the
// nodes fade up, staggered, then the edges draw in. Runs once, when the
// graph scrolls into view. Under reduced motion nothing is hidden or moved.

import { animate } from 'motion/mini';

export function mountHarnessGraph(root: HTMLElement): void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const nodes = [...root.querySelectorAll<HTMLElement>('.node')];
  const edges = [...root.querySelectorAll<SVGPathElement>('.edge')];
  const markers = [...root.querySelectorAll<SVGMarkerElement>('marker')];
  root.dataset.anim = 'ready';

  const play = () => {
    nodes.forEach((n, i) => {
      animate(
        n,
        {
          opacity: [0, 1],
          transform: ['translate(-50%, -30%)', 'translate(-50%, -50%)'],
        },
        { duration: 0.9, delay: 0.1 + i * 0.12, ease: 'easeOut' },
      );
    });
    const edgeDelay = 0.1 + nodes.length * 0.12 + 0.3;
    edges.forEach((e, i) => {
      animate(
        e,
        { strokeDashoffset: [1, 0] },
        {
          duration: 1.4,
          delay: edgeDelay + i * 0.08,
          ease: 'easeInOut',
        },
      );
    });
    markers.forEach((m) => {
      animate(m, { opacity: [0, 1] }, { duration: 0.4, delay: edgeDelay + 1 });
    });
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
