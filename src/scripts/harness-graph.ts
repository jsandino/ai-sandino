// The Harness Engineering page's graph: hover, then the entrance and rest
// motion, both shared with the other hub graphs (src/scripts/hub-graph.ts).

import { animateHubGraph, wireHubHover } from './hub-graph';

export function mountHarnessGraph(root: HTMLElement): void {
  wireHubHover(root);
  animateHubGraph(root);
}
