# 0007 — Write topic pages by hand, using the guide as a reference

**Status:** Accepted (provisional, see Consequences)
**Date:** 2026-10-07

---

## Context

Each topic has a long-form companion guide whose Markdown lives in the repo
(`src/content/<guide>/`). The topic page "draws from" it. The guide is
written for print: 50+ pages, with a cover, page breaks, raw LaTeX and
Mermaid. The page is meant to be visual and interactive, teaching the core
ideas in a few minutes of scrolling.

## Decision

Write each topic page **by hand** for the web, using the guide as a
reference. The guide Markdown is used only to build the PDF; the site
doesn't read it.

## Alternatives considered

- **Render guide chapters directly on the page:** one source of truth, but
  print-oriented prose and print-only syntax don't suit an interactive page,
  and it would force web Mermaid rendering (see ADR 0006).
- **Hybrid:** write the page by hand but embed a few self-contained sections
  (for example, the 12 heuristics) straight from the guide Markdown. Not
  ruled out; see Consequences.

## Consequences

- **Positive:** each page is free to be the best web version of its subject.
- **Negative:** the page and guide can drift; acceptable because the page is
  a summary, not a copy.
- **Neutral:** **provisional.** Javier wasn't sure, and the hybrid stays
  open for a specific section if one proves worth embedding exactly. Adopting
  it means a new ADR that supersedes this one.
