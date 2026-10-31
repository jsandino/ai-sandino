// The heuristics page parser (docs/briefs/harness-engineering.md): twelve
// cards, in order, with the guide's own wording.

import { expect, test } from 'vitest';
import heuristicsMd from '../../src/content/harness-guide/02-heuristics.md?raw';
import {
  capitalizeFirst,
  codeSpans,
  parseHeuristics,
  titleCase,
} from '../../src/lib/heuristics';

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

test('titleCase capitalises every word but the short connecting ones', () => {
  expect(parseHeuristics(heuristicsMd).map((h) => titleCase(h.name))).toEqual([
    'Map vs. Territory',
    'Progressive Disclosure',
    'Mechanical Enforcement',
    'Skills vs. Docs',
    'Earn the Check',
    'Errors as Remediation',
    'Fast Feedback Wins',
    'Immutable Decisions',
    'Sub-Agents as Firewalls',
    'Watch the Loop',
    'Compound the Fixes',
    'Project as Source of Truth',
  ]);
  // A minor word still opens and closes a name.
  expect(titleCase('the end of the')).toBe('The End of The');
});

test('capitalizeFirst raises a leading lowercase letter and nothing else', () => {
  expect(capitalizeFirst('delegate research and investigation')).toBe(
    'Delegate research and investigation',
  );
  expect(capitalizeFirst('pre-commit beats CI')).toBe('Pre-commit beats CI');
  expect(capitalizeFirst('ADRs are append-only')).toBe('ADRs are append-only');
  // A statement that opens with a code span is left as written.
  expect(capitalizeFirst('`CLAUDE.md` routes')).toBe('`CLAUDE.md` routes');
  const texts = parseHeuristics(heuristicsMd).map((h) => h.text);
  expect(texts.map((t) => capitalizeFirst(t)[0]).join('')).toMatch(/^[A-Z`]+$/);
});
