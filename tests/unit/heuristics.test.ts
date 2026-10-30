// The heuristics page parser (docs/briefs/harness-engineering.md): twelve
// cards, in order, with the guide's own wording.

import { expect, test } from 'vitest';
import heuristicsMd from '../../src/content/harness-guide/02-heuristics.md?raw';
import { codeSpans, parseHeuristics } from '../../src/lib/heuristics';

test('the guide yields twelve heuristics, numbered 1 to 12', () => {
  expect(parseHeuristics(heuristicsMd).map((h) => h.n)).toEqual(
    Array.from({ length: 12 }, (_, i) => i + 1),
  );
});

test('a heuristic keeps its name and statement verbatim', () => {
  expect(parseHeuristics(heuristicsMd)[2]).toEqual({
    n: 3,
    name: 'mechanical enforcement',
    text: "if a rule matters, make it mechanical. Prose drifts, checks don't.",
  });
});

test('codeSpans puts code at odd indexes', () => {
  expect(codeSpans('a `b` c')).toEqual(['a ', 'b', ' c']);
});
