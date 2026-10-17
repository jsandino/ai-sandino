# 0012 — Adopt agent autonomy in stages

- **Status:** Accepted
- **Date:** 2026-10-14

---

## Context

Until now the agent has worked gated: it proposes each step and waits for
`<<go>>`, and Javier approves every commit. The goal is for the agent to
implement a brief on its own (plan, change code, write tests, loop until
every check passes, commit, open the PR), in the spirit of Geoffrey
Huntley's loop ([`research/0005`](../../research/0005-ralph-loop.md)), with
Javier still reviewing and merging.

The risks are well documented. Loops amplify vague specs. Agents game weak
checks (stubs, deleted tests, loosened thresholds). Escalating autonomy
before the harness can catch mistakes hides problems until they compound
(the harness guide, §20). Today's harness has three gaps: no behaviour
tests (only build, links and Lighthouse), briefs that still have open
questions, and approval rules that assume every action is gated.

## Decision

Increase autonomy **in stages**. Each stage starts only when the previous
one has met its exit criterion.

| Stage | Mode | Javier reviews | Exit criterion |
|---|---|---|---|
| 0 | Gated pair programming (the default) | Every step | — |
| 1 | Autonomous within one session, on a Ready brief: plan → implement → test → commit on the run branch → `/pr` | The PR and the Cloudflare preview | 2–3 briefs land without serious rework |
| 2 | Headless loop (`make loop BRIEF=…`), watched: fresh context per iteration, one plan item per iteration, a separate worktree, a tool allowlist, iteration and spend caps | The first 3–5 iterations live, then the PR | The loop finishes a brief without Javier stepping in |
| 3 | The same loop, unattended | The PR only | Only for work whose acceptance criteria the checks fully cover |

Rules for every autonomous stage (1–3):

- **Only on a Ready brief:** no open questions, and every acceptance
  criterion is covered by a check or explicitly marked "human review".
- **Pre-approved:** changes within the brief's scope, `make` targets,
  commits on the run branch, and `/pr`.
- **Never:** merge; push to `main` or force-push; edit gate files (the CI
  workflow, `lefthook.yml`, `lighthouserc.json`, `tools/`, test config);
  delete or weaken a test to make it pass; `--no-verify`;
  `--dangerously-skip-permissions`.
- **Stop:** success means every plan item is done and every check passes.
  Three failed attempts at the same item means stop and report. Iteration
  and spend caps always apply.
- **Every failure is a harness gap:** fix the brief, the prompt or the
  checks, not just the output.

Before Stage 1: the CLAUDE.md approval rules (this PR), test layers
(Vitest; Playwright with axe), and brief readiness. The ordered plan lives
in [`docs/roadmap/`](../roadmap/README.md).

## Alternatives considered

- **Stay gated:** safe, but every change costs Javier's attention at each
  step, and it doesn't scale to five topics.
- **Go straight to a headless loop:** this harness can't yet verify what
  the briefs ask for, so the loop would declare unverified work done.
  Huntley himself recommends loops for greenfield work with strong tests.
- **Run unattended with `--dangerously-skip-permissions` in a sandbox:**
  it removes every permission check; an explicit allowlist in a separate
  worktree gives the same autonomy with limits.

## Consequences

- **Positive:** Javier reviews PRs instead of steps; harness gaps surface
  one stage at a time, while the work in front of us (the site) is the
  trial material.
- **Negative:** test infrastructure and fuller briefs are needed before the
  first autonomous run; two approval modes must be kept clearly apart.
- **Neutral:** at every stage, a human merges. Nothing reaches `main`
  without Javier.

## References

[`research/0005-ralph-loop.md`](../../research/0005-ralph-loop.md); the
harness guide, §19 (designing loops you can watch) and §20 (the hybrid
autonomy spectrum).
