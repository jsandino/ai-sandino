# 0005 — Huntley's loop ("Ralph") and headless Claude Code

- **Date:** 2026-10-14
- **Status:** Current
- **Question:** What is Geoffrey Huntley's autonomous coding loop, how is it
  driven, and what keeps its output high quality?

---

**Bottom line:** Ralph is a simple outer shell loop that restarts a headless agent with the same prompt file and a fresh context every iteration. Each pass does one task, and all state lives on disk (plan file, specs, git). Quality comes from back-pressure (tests, type checks, build) and a human who keeps tuning the prompt and plan, not from the agent's autonomy.

**Recommendation:** Adopt it in stages.
1. Write a thin loop driver in `scripts/`, exposed as a `make` target. It runs `claude -p` against a fixed prompt file that points at a brief, with an iteration cap and `--max-budget-usd`.
2. Treat the brief's acceptance criteria as the spec, with a plan file (Huntley's `fix_plan.md`) from which one item is picked per iteration.
3. Gate on the existing `make` checks plus unit tests, both inside the loop and in Lefthook and CI.
4. Stop at "all checks green, then commit and run `/pr`". Never let it merge.
5. Run it in a container or worktree, with explicit allow/deny rules rather than `--dangerously-skip-permissions`.
6. Start with new pages, and keep the human review step.

**Mechanics:**
- Loop: `while :; do cat PROMPT.md | claude-code ; done` (https://ghuntley.com/ralph/).
- A later variant, `claude -p --dangerously-skip-permissions`, appears only in third-party write-ups; it wasn't confirmed on his page.
- Prompt lines he quotes: "Follow the fix_plan.md and choose the most important 10 things"; "Before making changes search codebase (don't assume not implemented) using subagents"; "After implementing functionality or resolving problems, run the tests for that unit of code"; "DO NOT IMPLEMENT PLACEHOLDER OR SIMPLE IMPLEMENTATIONS. WE WANT FULL IMPLEMENTATIONS."
- Files: `PROMPT.md` (per-iteration instructions), `fix_plan.md` (a dynamic, often regenerated TODO list), `AGENT.md` (build and test learnings the agent records), `specs/`, and a "stdlib" of conventions.

**Key findings:**
- **One task per loop:** "Only one thing per loop", to conserve the usable context (roughly 170k tokens; quality degrades before the advertised maximum). (source: https://ghuntley.com/ralph/, confidence: high)
- **Sub-agents manage context:** the main context schedules; sub-agents do searches and spec study. Only **one** sub-agent runs build and tests, so back-pressure isn't flooded. (source: https://ghuntley.com/ralph/, confidence: high)
- **Back-pressure:** run the changed unit's tests after each change; tests carry a docstring explaining their purpose; add type checkers for dynamic languages. "If you aren't capturing your back-pressure then you are failing as a software engineer." (source: https://ghuntley.com/pressure/, confidence: high)
- **Anti-cheating:** mostly strongly worded prompts against placeholders and stubs, plus "search before assuming it's missing". Nothing specific on test deletion; mechanical gates and review have to cover it. (source: https://ghuntley.com/ralph/, confidence: high for what he says, low on test deletion)
- **Failure handling:** fix the prompt or conventions rather than the output ("Ralph gets tuned - like a guitar"); hard reset when errors flood the context; delete and regenerate the plan often ("The TODO list is what I'm watching like a hawk"). No automatic stop condition: a human watches. (source: https://ghuntley.com/ralph/, confidence: high)
- **When it works:** greenfield work with clear specs and strong tests, about 90% complete before manual takeover. "There's no way in heck would I use Ralph in an existing code base." Spec errors cost him weeks of wasted loops. (source: https://ghuntley.com/ralph/, confidence: high)
- **Human role:** "programming the loop"; senior expertise is still required. (sources: https://ghuntley.com/loop/, https://ghuntley.com/ralph/, confidence: high)
- **Headless Claude Code:** `claude -p` reads stdin and exits non-zero on failure; `--output-format json` includes `total_cost_usd`; `--allowedTools` uses permission-rule syntax; `--permission-mode dontAsk` denies anything not pre-allowed; `--max-budget-usd` caps spend; `--bare` skips CLAUDE.md, hooks and skills (so don't use it if CLAUDE.md and `/pr` are needed); `/skill-name` works inside a `-p` prompt; project hooks run in `-p` mode. (source: https://code.claude.com/docs/en/headless, confidence: high)

**Caveats:** The pages were fetched as summaries, so the quotes should be re-checked against the originals. The `--dangerously-skip-permissions` variant and the `AGENTS.md` / `IMPLEMENTATION_PLAN.md` layout come from third-party write-ups (e.g. https://wikidocs.net/368376). Claude Code flags change quickly; check `claude --help` locally before relying on one.
