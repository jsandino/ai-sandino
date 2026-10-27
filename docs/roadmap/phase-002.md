# Phase 002 — Autonomy foundations and Site v1

- **Status:** Current
- **Dates:** 2026-10-14 →

---

## Goal

Make the agent able to implement a brief on its own (Stage 1 of
[ADR 0012](../decisions/0012-staged-agent-autonomy.md)), and use those runs
to build the first version of the site: the shared shell, the landing page
and the Harness Engineering page. Along the way, make the PDF pipeline build
any guide ([ADR 0016](../decisions/0016-guide-format-and-generic-pdf-pipeline.md)),
so the next guides can be imported from their PDFs.

## Steps

| # | Step | Brief | Mode | Status |
|---|---|---|---|---|
| 1 | Staged autonomy: ADR 0012, the CLAUDE.md Approvals section (`<<loop>>`), this roadmap | — | gated | Done |
| 2 | Header formatting: one field per line (bullets) in every ADR, research summary, phase file and brief, and in both templates; allow formatting-only fixes to ADRs and research | — | gated | Done |
| 3 | Test layers: Vitest and Playwright (with axe), `make` targets, hooks and CI; one smoke test each | — | gated | Done |
| 4 | Brief readiness: the rule (no open questions; every criterion maps to a check or "human review"); settle the shell brief's open questions | [shell](../briefs/shell.md) | gated | Done |
| 5 | Stage 1 trial: `<<loop>> shell.md` | [shell](../briefs/shell.md) | loop | Done |
| 6 | Tune the harness from the shell run | — | gated | Done |
| 7 | Stage 1: `<<loop>> landing.md` (settle its open questions first) | [landing](../briefs/landing.md) | loop | Done |
| 8 | Guide format: ADR 0016, the pipeline brief, the PDF hook triggered by any guide | [pdf-pipeline](../briefs/pdf-pipeline.md) | gated | Done |
| 9 | Stage 1: `<<loop>> pdf-pipeline.md` (guide structure; harness PDF unchanged apart from its contents page) | [pdf-pipeline](../briefs/pdf-pipeline.md) | loop | Done |
| 10 | Guide content conventions: the `::: spread` block, diagram colour names and their print palette, the check against raw LaTeX and hard-coded colours; migrate the harness guide's heuristics page and diagrams | — | gated | Next |
| 11 | Import the first guide from its PDF: a faithful extraction, then a refinement pass | — | gated | Planned |
| 12 | Stage 1: `<<loop>> harness-engineering.md` (settle its open questions first) | [harness-engineering](../briefs/harness-engineering.md) | loop | Planned |
| 13 | Stage 2 tools: prompt template, plan-file convention, iteration logs, `scripts/loop.sh` + `make loop`, worktree handling, permission profile (including deny rules for gate files) | — | gated | Planned |
| 14 | First Stage 2 run, watched (only once Stage 1's exit criterion is met) | — | loop | Planned |

## Exit criterion

All fourteen steps are Done: the four briefs are Done, Stage 1's exit
criterion is met (2–3 briefs landed without serious rework), and the first
watched Stage 2 run has completed.
