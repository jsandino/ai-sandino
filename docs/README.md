# ai-sandino — Documentation

This directory is the **system of record** for ai-sandino.
[`CLAUDE.md`](../CLAUDE.md) at the repo root says how to behave; everything
about what the project *is* lives here.

---

## Current status

> **Phase:** Harness foundation
> **In progress:** `CLAUDE.md`, `docs/`, first ADRs (branch `docs/harness-foundation`)
> **Next step:** Kickoff step 5: propose the CI workflow
> **Open questions:** none

Update this block in the same commit as the work that changes it. Keep the
four fields; keep each to one line.

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
| Running, building, checking; `make`; git workflow; hooks and CI | [`development.md`](development.md) |
| Tools to install locally (PDF toolchain, Node) | [`prerequisites.md`](prerequisites.md) |
| Why something is the way it is | [`decisions/`](decisions/README.md) |
| Past research investigations | [`research/`](../research/README.md) |

---

## Documentation conventions

- **Top-level docs** describe stable, long-lived properties of the project.
  Each has one job; if a fact fits two docs, it lives in one and the other
  links to it.
- **`decisions/`** holds ADRs: immutable records of non-obvious decisions.
- **`design/`** holds visual references. `style-sample.html` is a frozen
  mood board; `design-system.md` is the source of truth.
- **`/research/`** at the repo root holds summaries from the researcher
  sub-agent.

### Update discipline

- Update **Current status** whenever the focus shifts.
- Update docs **in the same commit** as the code they describe.
- Never edit an accepted ADR; write a new one that supersedes it.
- A significant change to `architecture.md` or `tech-stack.md` needs an ADR
  explaining why.
- If a fresh session has to ask something these docs should answer, that's a
  docs gap: fix the doc, then carry on.
