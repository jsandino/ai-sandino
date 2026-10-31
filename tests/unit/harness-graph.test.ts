// The harness graph's data (docs/briefs/harness-engineering.md, *Graph*).

import { expect, test } from 'vitest';
import {
  centre,
  edgeD,
  edges,
  hub,
  parts,
  phone,
  wide,
} from '../../src/lib/harness-graph';

test('six parts, Part I to VI', () => {
  expect(parts.map((p) => p.numeral)).toEqual([
    'I',
    'II',
    'III',
    'IV',
    'V',
    'VI',
  ]);
});

test('the hub connects to every part, and nothing else is connected', () => {
  expect(edges.map((e) => `${e.from}>${e.to}`)).toEqual(
    parts.map((p) => `${hub.id}>${p.id}`),
  );
});

test('every edge has a path in both layouts, and every node has a box', () => {
  for (const layout of [wide, phone]) {
    expect(Object.keys(layout.boxes).sort()).toEqual(
      [hub.id, ...parts.map((p) => p.id)].sort(),
    );
    for (const e of edges)
      expect(edgeD(centre(layout, e.from), centre(layout, e.to))).toMatch(
        /^M[\d. -]+ L[\d. -]+$/,
      );
  }
});
