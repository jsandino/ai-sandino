# ai-sandino — Agent engagement rules

This file tells the agent **how to behave** in this repository.
For **what this project is**, see [`docs/README.md`](docs/README.md).

---

## Orientation: read this first

ai-sandino is the source for **ai.sandino.ca**, Javier Sandino's personal site
teaching practical AI engineering through animated, interactive pages, each
with a companion PDF guide and a GitHub project. Astro + Tailwind, static,
deployed by Cloudflare Pages on merge to `main`. For architecture, stack,
design system, decisions and current status, see
[`docs/README.md`](docs/README.md).

---

## [!] Inviolable constraints

- Never push to `main`. Every change goes on a feature branch and through a PR.
- Never merge a PR. Javier merges.
- Never bypass hooks (`--no-verify`) or weaken a check to make it pass.
  Fix the cause, or ask.
- Never edit the guide source (`src/content/harness-guide/`) without being
  asked. It is authored content, not code.
- Never edit an accepted ADR. Supersede it with a new one
  ([`docs/decisions/`](docs/decisions/)).
- Never touch DNS, Cloudflare or GitHub settings. Propose the change and
  Javier applies it.

---

## Agent team

| Agent | Role | Model | Invocation |
|---|---|---|---|
| **Coding agent** (default) | Implements, debugs, refactors, proposes | Opus | Default |
| **Researcher** (sub-agent) | Investigates outside the repo, returns a structured summary | Sonnet | `researcher` agent |

### Delegate to `researcher` before acting on:

- Library, tool or framework comparisons
- External APIs and service behaviour (Astro, Motion, D3, Cloudflare, GitHub Actions)
- Any "how does X work?" question about something outside this repo

Save each returned summary to `research/YYYY-MM-DD-<slug>.md` and check
`research/` first. The question may already be answered.

### Handle directly:

- Anything answerable from this repo: code, `docs/`, ADRs, `research/`
- Writing and editing code, running checks, debugging

---

## Working style

1. **One question at a time.** Ask one question, discuss it until it is
   resolved, then wait for `<<go>>` before the next.
2. **One step at a time.** Explain what you are about to do and **why**,
   propose it, then wait for `<<go>>` before implementing.
3. When there is a choice, present the options and **recommend one**.
4. **Keep it minimal.** Build only what the current step needs. No
   speculative scaffolding.
5. **Research → plan → execute → verify** for any significant change. Run
   checks as you go, not only at the end.
6. Write the ADR **before** implementing a non-obvious decision, and update
   docs **in the same commit** as the code they describe.
7. Every recurring mistake is a harness gap. Propose the check, rule or
   doc fix instead of just patching it.

---

## Git workflow

- Branch names: `feat/…`, `fix/…`, `chore/…`, `docs/…`
- Commits follow Conventional Commits, with one paragraph saying **why**.
- Lefthook runs the pre-commit checks. If one fails, read its message: it
  says how to fix the problem.
- Before opening a PR, make sure the full check suite passes.

---

## Commands

Every command (run, build, check and dependency changes) goes through
`make`, locally and in CI alike. The `Makefile` lists the targets.
Never call npm or npx directly; if a target is missing, add one.

---

## Where to look

Start at [`docs/README.md`](docs/README.md): its **Current status** section
says what's in progress, and its [routing table](docs/README.md#where-to-look)
says which doc to read for each kind of task.
