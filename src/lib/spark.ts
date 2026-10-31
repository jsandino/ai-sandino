// The hub's spark, shared by the landing and harness graphs: every 2.5–5s a
// jagged arc races part-way round the hub, then fades (docs/design-system.md#motion).

const NS = 'http://www.w3.org/2000/svg';

// "The centre is charged": a jagged arc of `span` radians from angle `from`.
function jaggedArc(r: number, from: number, span: number, steps = 16) {
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const a = from + (span * i) / steps;
    const rr = r + (i === 0 || i === steps ? 0 : (Math.random() - 0.5) * 7);
    d += `${i ? 'L' : 'M'}${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`;
  }
  return d;
}

/**
 * Sparks around `host`'s origin at `radius`, first after `firstDelay` ms.
 * Styled by the page's `.spark` rule. Returns a function that stops it.
 */
export function startSpark(
  host: SVGElement,
  radius: number,
  firstDelay: number,
): () => void {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let frame = 0;
  let arc: SVGPathElement | undefined;

  const spark = () => {
    arc = document.createElementNS(NS, 'path');
    arc.setAttribute('class', 'spark');
    arc.setAttribute('aria-hidden', 'true');
    arc.style.opacity = '0';
    host.append(arc);
    const own = arc;
    const start = Math.random() * Math.PI * 2;
    const span = Math.PI * (0.45 + Math.random() * 0.35);
    const t0 = performance.now();
    const tick = () => {
      const t = Math.min(1, (performance.now() - t0) / 700);
      own.setAttribute('d', jaggedArc(radius, start + t * Math.PI * 1.1, span));
      own.style.opacity = String(
        t < 0.15 ? t / 0.15 : t > 0.7 ? (1 - t) / 0.3 : 1,
      );
      if (t >= 1) own.remove();
      else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    timeout = setTimeout(spark, 2500 + Math.random() * 2500);
  };

  timeout = setTimeout(spark, firstDelay);
  return () => {
    clearTimeout(timeout);
    cancelAnimationFrame(frame);
    arc?.remove();
  };
}
