# Phase 002 — Autonomy foundations and Site v1

**Status:** Current
**Dates:** 2026-10-14 →

---

## Goal

Make the agent able to implement a brief on its own (Stage 1 of
[ADR 0012](../decisions/0012-staged-agent-autonomy.md)), and use those runs
to build the first version of the site: the shared shell, the landing page
and the Harness Engineering page.

## Steps

| # | Step | Brief | Status |
|---|---|---|---|
| 1 | Staged autonomy: ADR 0012, the CLAUDE.md Approvals section (`<<loop>>`), this roadmap | — | Done |
| 2 | Header formatting: one field per line (bullets) in every ADR, research summary and phase file, and in both templates; allow formatting-only fixes to ADRs and research | — | Next |
| 3 | Test layers: Vitest and Playwright (with axe), `make` targets, hooks and CI; one smoke test each | — | Planned |
| 4 | Brief readiness: the rule (no open questions; every criterion maps to a check or "human review"); settle the shell brief's open questions | [shell](../briefs/shell.md) | Planned |
| 5 | Stage 1 trial: `<<loop>> shell.md` | [shell](../briefs/shell.md) | Planned |
| 6 | Tune the harness from the shell run | — | Planned |
| 7 | Stage 1: `<<loop>> landing.md` (settle its open questions first) | [landing](../briefs/landing.md) | Planned |
| 8 | Stage 1: `<<loop>> harness-engineering.md` (settle its open questions first) | [harness-engineering](../briefs/harness-engineering.md) | Planned |
| 9 | Stage 2 tools: prompt template, plan-file convention, iteration logs, `scripts/loop.sh` + `make loop`, worktree handling, permission profile (including deny rules for gate files) | — | Planned |
| 10 | First Stage 2 run, watched (only once Stage 1's exit criterion is met) | — | Planned |

## Exit criterion

All ten steps are Done: the three briefs are Done, Stage 1's exit
criterion is met (2–3 briefs landed without serious rework), and the first
watched Stage 2 run has completed.
