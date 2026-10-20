# Documentation

This directory is the **system of record** for ai-sandino.
[`CLAUDE.md`](../CLAUDE.md) at the repo root says how to behave; everything
about what the project *is* lives here.

---

## Current status

- **Phase:** [002 — Autonomy foundations and Site v1](roadmap/phase-002.md)
- **Next step:** 5 — Stage 1 trial: `<<loop>> shell.md` (see the phase file)

Every PR updates this block to describe the state **after it merges** (not
while it is open), so `main` is never stale. Two fields, one line each:
everything else lives in the phase file and its briefs.

---

## Overview

ai-sandino is the source for [ai.sandino.ca](https://ai.sandino.ca), Javier
Sandino's personal site teaching practical AI engineering. It covers five
topics: harness engineering with code agents, RAG in production, LLM gateways
and token quotas, the transformer architecture, and autonomous agents with
Google's ADK. Harness engineering is the first to be built; the other four
appear on the landing page as "coming soon".

Each topic page is a visually rich, animated explainer that teaches through
diagrams and interaction rather than long prose. Each comes with a
downloadable companion PDF guide and a link to a GitHub project that
demonstrates the ideas in practice. The landing page is a short introduction
plus a node graph of the five topics, which is the site's main navigation.

The site is static (Astro), styled with Tailwind, and ships JavaScript only
where interaction needs it. It deploys to Cloudflare Pages on every merge to
`main`. The design principles: minimalist in spirit, visually rich, the same
shell on every page, mobile-first, and fast.

The project is itself built following harness engineering: this `docs/`
directory, the ADRs, the git hooks and the CI checks are the harness. The
companion guide for topic 1 is in `src/content/harness-guide/`.

---

## Where to look

| If the task involves… | Read… |
|---|---|
| How the site is put together: routes, topic data, pages, PDF pipeline, repo layout | [`architecture.md`](architecture.md) |
| What we use and why | [`tech-stack.md`](tech-stack.md) |
| Colours, fonts, components, animation | [`design-system.md`](design-system.md) |
| What work is planned, in what order, and what's done | [`roadmap/`](roadmap/README.md) |
| Building a page or the shared shell: what it must contain, acceptance criteria, open questions | [`briefs/`](briefs/) (`shell.md`, `landing.md`, `harness-engineering.md`) |
| Running, building, checking; `make`; git workflow; hooks and CI | [`development.md`](development.md) |
| Tools to install locally (PDF toolchain, Node) | [`prerequisites.md`](prerequisites.md) |
| Why something is the way it is | [`decisions/`](decisions/README.md) |
| Past research investigations | [`research/`](../research/README.md) |

---

## Documentation conventions

- **Top-level docs** describe stable, long-lived properties of the project.
  Each has one job; if a fact fits two docs, it lives in one and the other
  links to it.
- **`decisions/`** holds ADRs: records of non-obvious decisions.
- **`roadmap/`** holds one file per phase: its goal, ordered steps and their
  status, with links to the briefs. Rules and the phase index are in its
  README.
- **`briefs/`** holds one brief per page (plus the shared shell): purpose,
  required content, acceptance criteria and open questions. Its **Status**
  is **Draft** (open questions remain), **Ready** (none remain, every
  criterion maps to a check or "human review", and all user-facing text is
  either in the brief or explicitly marked "placeholder OK"; a `<<loop>>`
  may start), or **Done**. A brief is a work order, not a living doc:
  - Each acceptance criterion ends with what verifies it:
    `→ check: <make target or CI>` or `→ human review`. One without either
    keeps the brief in Draft.
  - Write it just in time, as its own step and PR (not inside a build PR).
  - Answer its open questions in the brief ("Decided: …") before building;
    add an ADR if an answer is non-obvious and spans pages.
  - The PR that builds the page sets its **Status** to `Done`; it is then
    frozen. A later redesign gets a new brief. Never write a PR's own number
    into it: the number doesn't exist until the PR is opened. `git log`
    finds the PR, and a phase's closing PR can list them (as `phase-001.md`
    does).
  - **A phase step that builds a page links a Ready brief before it
    starts.** If none exists, writing it comes first, as its own step.
- **`design/`** holds visual references. `style-sample.html` is a frozen
  mood board; `design-system.md` is the source of truth.
- **`/research/`** at the repo root holds summaries from the researcher
  sub-agent.

### Update discipline

- Update **Current status** whenever the focus shifts.
- Update docs **in the same commit** as the code they describe.
- A significant change to `architecture.md` or `tech-stack.md` needs an ADR
  explaining why.
- If a fresh session has to ask something these docs should answer, that's a
  docs gap: fix the doc, then carry on.
