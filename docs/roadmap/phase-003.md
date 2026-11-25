# Phase 003 — Transformers guide

- **Status:** Done
- **Dates:** 2026-10-27 → 2026-11-25
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
| 10 | Part VIII — The full transformer block | — | gated | Done |
| 11 | Part IX — Output processing (without sampling) | — | gated | Done |
| 12 | Part X — Encoder and decoder families | — | gated | Done |
| 13 | Part XI — A complete worked example | — | gated | Dropped |
| 14 | Part XII — Implementation notes | — | gated | Dropped |
| 15 | References: the sources, as a closing appendix | — | gated | Done |

Steps 13 and 14 are dropped to keep the guide to the essentials: Part XI's
numeric forward pass repeats the worked examples in Parts III to VII (Part VIII
ends with a shape trace instead), and Part XII's code belongs in the companion
GitHub project. Sampling is left out of Part IX because it is inference, not
architecture.

## Exit criterion

Every step is Done, the guide's PDF builds through the shared pipeline, and
`feat/transformers-guide` has merged to `main`.
