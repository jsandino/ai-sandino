// The Heuristics graph's layout (docs/briefs/harness-engineering.md,
// *Heuristics*).

import { expect, test } from 'vitest';
import {
  centre,
  labelFor,
  phone,
  ringPoint,
  wide,
  wrapWords,
} from '../../src/lib/heuristics-graph';

test('twelve nodes sit on the ring, the first at the top, then clockwise', () => {
  for (const l of [wide, phone]) {
    const c = centre(l);
    const pts = Array.from({ length: 12 }, (_, i) => ringPoint(l, i));
    expect(pts[0].x).toBeCloseTo(c.x);
    expect(pts[0].y).toBeCloseTo(c.y - l.ry);
    expect(pts[3].x).toBeCloseTo(c.x + l.rx); // three o'clock
    expect(pts[6].y).toBeCloseTo(c.y + l.ry); // the bottom
    expect(pts[9].x).toBeCloseTo(c.x - l.rx); // nine o'clock
    // Every node is inside the frame, with room for its ring.
    for (const p of pts) {
      expect(p.x - l.r).toBeGreaterThanOrEqual(0);
      expect(p.x + l.r).toBeLessThanOrEqual(l.width);
      expect(p.y - l.r).toBeGreaterThanOrEqual(0);
      expect(p.y + l.r).toBeLessThanOrEqual(l.height);
    }
  }
});

test('labels point away from the hub: sides beside, top above, bottom below', () => {
  const at = (i: number) => labelFor(wide, i, 'Name');
  expect(at(0).anchor).toBe('middle');
  expect(at(0).y).toBeLessThan(0); // above
  expect(at(6).anchor).toBe('middle');
  expect(at(6).y).toBeGreaterThan(wide.r); // below
  for (const i of [1, 2, 3, 4, 5]) expect(at(i).anchor).toBe('start');
  for (const i of [7, 8, 9, 10, 11]) expect(at(i).anchor).toBe('end');
  expect(at(3).x).toBeGreaterThan(wide.r);
  expect(at(9).x).toBeLessThan(-wide.r);
});

test('wrapWords wraps at a character limit and keeps long words whole', () => {
  expect(wrapWords('Project as Source of Truth', 16)).toEqual([
    'Project as',
    'Source of Truth',
  ]);
  expect(wrapWords('Map vs. Territory', 40)).toEqual(['Map vs. Territory']);
  expect(wrapWords('Extraordinarily long', 5)).toEqual([
    'Extraordinarily',
    'long',
  ]);
});

test('on the phone a multi-line top label grows upward, off the node', () => {
  const one = labelFor(phone, 0, 'Short');
  const two = labelFor(phone, 0, 'Map vs. Territory');
  expect(two.lines).toHaveLength(2);
  expect(two.y).toBeLessThan(one.y);
});
