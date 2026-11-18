# Phase 003 — Transformers guide

- **Status:** Current
- **Dates:** 2026-10-27 →
- **Branch:** `feat/transformers-guide` (long-lived; [ADR 0017](../decisions/0017-parallel-phases.md))

---

## Goal

Import the transformers guide from its source PDF into
`src/content/transformers/`, so the shared PDF pipeline builds it with the
same look as the harness guide ([`guide-format.md`](../guide-format.md)).
The import goes one source page at a time: content is revised, diagrams are
redrawn from scratch, and broken symbols are fixed. The source's chapters
become parts, and their sections are numbered across the guide. Each part
is reviewed before it is committed, one commit per part.

Moved here from phase 002, step 11.

## Steps

| # | Step | Brief | Mode | Status |
|---|---|---|---|---|
| 1 | Metadata and intro (`00-intro.md`) | — | gated | Done |
| 2 | Notation and conventions | — | gated | Done |
| 3 | Part I — Foundations | — | gated | Done |
| 4 | Part II — Input processing | — | gated | Done |
| 5 | Part III — Scaled dot-product attention | — | gated | Done |
| 6 | Part IV — Multi-head attention | — | gated | Done |
| 7 | Part V — Causal masking | — | gated | Done |
| 8 | Part VI — The feed-forward network | — | gated | Done |
| 9 | Part VII — Residuals and normalization | — | gated | Done |
| 10 | Part VIII — The full transformer block | — | gated | Next |
| 11 | Part IX — Output processing | — | gated | Planned |
| 12 | Part X — Encoder–decoder vs decoder-only | — | gated | Planned |
| 13 | Part XI — A complete worked example | — | gated | Planned |
| 14 | Part XII — Implementation notes | — | gated | Planned |
| 15 | Further reading: the sources, as a closing appendix | — | gated | Planned |

## Exit criterion

Every step is Done, the guide's PDF builds through the shared pipeline, and
`feat/transformers-guide` has merged to `main`.
