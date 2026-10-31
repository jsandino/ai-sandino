// The twelve heuristics, read from the guide's own page so the wording stays
// verbatim (docs/decisions/0018, docs/briefs/harness-engineering.md).

export type Heuristic = { n: number; name: string; text: string };

/** Parse lines like `**1. map vs. territory** — statement` from the guide. */
export function parseHeuristics(markdown: string): Heuristic[] {
  return [...markdown.matchAll(/^\*\*(\d+)\. (.+?)\*\* — (.+)$/gm)].map(
    (m) => ({ n: Number(m[1]), name: m[2], text: m[3] }),
  );
}

/** Split a statement on `code` spans: odd indexes are code. */
export function codeSpans(text: string): string[] {
  return text.split('`');
}

// Chicago-style: articles, conjunctions and prepositions stay lowercase,
// except as the first or last word.
const MINOR = new Set([
  'a',
  'an',
  'and',
  'as',
  'at',
  'but',
  'by',
  'for',
  'in',
  'nor',
  'of',
  'on',
  'or',
  'the',
  'to',
  'vs.',
  'with',
]);

/** A guide name in title case: "map vs. territory" → "Map vs. Territory". */
export function titleCase(name: string): string {
  const words = name.split(' ');
  return words
    .map((w, i) =>
      MINOR.has(w) && i > 0 && i < words.length - 1
        ? w
        : w.replace(/(^|-)(\p{L})/gu, (_, sep, c) => sep + c.toUpperCase()),
    )
    .join(' ');
}

/**
 * A guide statement starts with a capital: "delegate research…" → "Delegate
 * research…". One that opens with a code span or a capital is left alone.
 */
export function capitalizeFirst(text: string): string {
  return text.replace(/^\p{Ll}/u, (c) => c.toUpperCase());
}

export const CARD_PROMPT = 'Pick a heuristic to see what it says.';
