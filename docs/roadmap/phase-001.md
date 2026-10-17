# Phase 001 — Harness foundation

- **Status:** Done
- **Dates:** 2026-10-01 → 2026-10-14

---

## Goal

Build the harness before the site: the context the agent reads, the checks
that catch mistakes, and the workflow that keeps `main` safe.

## Delivered

| PR | What |
|---|---|
| [#1](https://github.com/jsandino/ai-sandino/pull/1) | Guide source and the local PDF pipeline, rebuilt by a pre-commit hook |
| [#2](https://github.com/jsandino/ai-sandino/pull/2) | `CLAUDE.md`, `docs/`, ADRs 0001–0009, researcher sub-agent, numbered research |
| [#3](https://github.com/jsandino/ai-sandino/pull/3) | CI: build, links, Lighthouse and PDF freshness on every PR (ADR 0010) |
| [#4](https://github.com/jsandino/ai-sandino/pull/4) | Node 24 pinned; Current status written as the state after merge |
| [#5](https://github.com/jsandino/ai-sandino/pull/5) | `make merged` for post-merge cleanup |
| [#6](https://github.com/jsandino/ai-sandino/pull/6) | L1–L2 checks: Prettier, ESLint, `astro check` in hooks and CI (ADR 0011) |
| [#7](https://github.com/jsandino/ai-sandino/pull/7) | Agents blocked from calling package managers directly |
| [#8](https://github.com/jsandino/ai-sandino/pull/8) | Page briefs (shell, landing, harness-engineering) |
| [#9](https://github.com/jsandino/ai-sandino/pull/9) | Install-script fix for Node 24's npm |

Also applied by hand: the `protect-main` ruleset, with `site` and `pdf` as
required checks (see `docs/development.md`).
