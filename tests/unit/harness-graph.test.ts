// The harness graph's data (docs/briefs/harness-engineering.md, *Graph*).

import { expect, test } from 'vitest';
import {
  centre,
  edgeD,
  edges,
  parts,
  phone,
  wide,
} from '../../src/lib/harness-graph';

test('six parts, Part I to VI, with the primitives coloured', () => {
  expect(parts.map((p) => p.numeral)).toEqual([
    'I',
    'II',
    'III',
    'IV',
    'V',
    'VI',
  ]);
  expect(parts.map((p) => p.colour)).toEqual([
    'neutral',
    'context',
    'constraints',
    'capabilities',
    'feedback',
    'neutral',
  ]);
});

test('eight frame edges and three directed links, none from feedback to context', () => {
  expect(edges.filter((e) => !e.directed)).toHaveLength(8);
  expect(
    edges.filter((e) => e.directed).map((e) => `${e.from}>${e.to}`),
  ).toEqual([
    'capabilities>context',
    'context>constraints',
    'constraints>feedback',
  ]);
});

test('every edge has a path in both layouts, and every part has a box', () => {
  for (const layout of [wide, phone]) {
    expect(Object.keys(layout.boxes).sort()).toEqual(
      parts.map((p) => p.id).sort(),
    );
    for (const e of edges)
      expect(
        edgeD(
          centre(layout, e.from),
          centre(layout, e.to),
          layout.r,
          e.directed,
        ),
      ).toMatch(/^M[\d. -]+ L[\d. -]+$/);
  }
});

test('a directed edge stops one radius short of its target; an undirected one reaches the centre', () => {
  const a = { x: 0, y: 0 };
  const b = { x: 0, y: 100 };
  expect(edgeD(a, b, 26, true)).toBe('M0 0 L0 74');
  expect(edgeD(a, b, 26, false)).toBe('M0 0 L0 100');
});
