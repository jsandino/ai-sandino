# Agent engagement rules

This file tells the agent **how to behave** in this repository.
For **what this project is**, see [`docs/README.md`](docs/README.md).

## Orientation

This repo is the source for **ai.sandino.ca**, a personal site that teaches
practical AI engineering through interactive pages, each with a companion
PDF guide and a GitHub project. Start at [`docs/README.md`](docs/README.md):
its **Current status** says what's in progress, and its
[routing table](docs/README.md#where-to-look) says which doc to read for
each kind of task.

## [!] Inviolable constraints

- Never push to `main`. Every change goes on a feature branch and through a PR.
- Never merge a PR. Javier merges.
- Never bypass hooks (`--no-verify`) or weaken a check to make it pass.
  Fix the cause, or ask.
- Never edit the guide source (`src/content/harness-guide/`) without being
  asked. It is authored content, not code.
- Never change the substance of an accepted ADR or research summary:
  supersede it with a new one. Formatting-only fixes are allowed when
  Javier asks for them.
- Never touch DNS, Cloudflare or GitHub settings. Propose the change and
  Javier applies it.

## Researcher sub-agent

Delegate to `researcher` (read-only, Sonnet) before acting on:

- Library, tool or framework comparisons
- External APIs and service behaviour (Astro, Motion, D3, Cloudflare, GitHub Actions)
- Any "how does X work?" question about something outside this repo

Save each returned summary to `research/NNNN-<slug>.md` (format and index in
[`research/README.md`](research/README.md)), and check that index first. The
question may already be answered.

## Working style

1. **One question at a time.** Ask one question, discuss it until it is
   resolved, then wait for `<<go>>` before the next.
2. **One step at a time** (gated mode). Explain what you are about to do
   and **why**, propose it, then wait for `<<go>>` before implementing.
3. When there is a choice, present the options and **recommend one**.
4. **Keep it minimal.** Build only what the current step needs. No
   speculative scaffolding.
5. **Research → plan → execute → verify** for any significant change. Run
   checks as you go, not only at the end.
6. Write the ADR **before** implementing a non-obvious decision, and update
   docs **in the same commit** as the code they describe.
7. Every recurring mistake is a harness gap. Propose the check, rule or
   doc fix instead of just patching it.

## Approvals

Two modes ([ADR 0012](docs/decisions/0012-staged-agent-autonomy.md)).
**Gated is the default.** Autonomous mode applies only when Javier
explicitly starts a run on a named, Ready brief.

**Gated (default)**

- A `<<go>>` approves only the step that was proposed. Committing and
  deleting a branch (local or remote) are separate steps, each needing its
  own `<<go>>`.
- Show the exact commit message before every commit.
- Javier pushes and opens PRs with `/pr`. When a branch is ready, say so and
  stop.
- Experiments with side effects (throwaway commits, branch juggling) run in
  a separate `git worktree`, never on the working branch.

**Autonomous (Stage 1 and later, one Ready brief per run)**

Start a run only with `<<loop>> <brief>`, e.g. `<<loop>> shell.md`, which
means `docs/briefs/shell.md`. No other wording switches mode. On receiving it:

1. Check the brief exists and is Ready, as defined in
   [`docs/README.md`](docs/README.md#documentation-conventions). If not,
   refuse and say what's missing.
2. Post the run branch and the plan in one message, then proceed without
   waiting.
3. The run ends when `/pr` reports the PR, or when it stops (see below);
   the session then returns to gated mode.

- Pre-approved: changes within the brief's scope, `make` targets, commits on
  the run branch, and `/pr` once every check passes.
- Never: anything in *Inviolable constraints*, plus force-push, editing
  gate files (`.github/`, `lefthook.yml`, `lighthouserc.json`, `tools/`,
  test config), or deleting or weakening a test.
- Stop and report after three failed attempts at the same item, or when
  blocked by anything the brief doesn't answer.

## Git workflow

- Branch names: `feat/…`, `fix/…`, `chore/…`, `docs/…`
- Commits follow Conventional Commits, with one paragraph saying **why**.

## Commands

Every command (run, build, check and dependency changes) goes through
`make`, locally and in CI alike. The `Makefile` lists the targets.
Never call npm or npx directly; if a target is missing, add one.
