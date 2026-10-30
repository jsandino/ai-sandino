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
