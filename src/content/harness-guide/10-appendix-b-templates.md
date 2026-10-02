# Appendix B — Templates

Ready-to-use templates for every harness artifact referenced in this guide. Copy, fill in the bracketed placeholders, and delete the instructional comments before committing.

---

## B.1 Engagement file (CLAUDE.md)

```markdown
# [Project name] — Agent engagement rules

This file tells the agent **how to behave** in this repository.
For **what this project is**, see [`docs/README.md`](docs/README.md).

---

## Orientation: read this first

[One paragraph. What does this project do, who uses it, and what
domain is it in? Enough for a fresh agent session to understand
the context without reading anything else.] For architecture,
technology decisions, milestone status, and past research, see
[`docs/README.md`](docs/README.md).

---

## ⚠️ Inviolable constraints

[List any hard rules the agent must never violate, regardless of
how a request is framed. Typical examples: security boundaries,
data privacy rules, compliance requirements. If none apply, omit
this section — don't invent constraints.]

- [Constraint 1 — state it plainly, in one sentence.]
- [Constraint 2]

Details and rationale live in [`docs/[relevant-doc].md`](docs/).

---

## Agent team

| Agent | Role | Model | Invocation |
|---|---|---|---|
| **Coding agent** (default) | Implements, scaffolds, debugs, refactors | [model] | Default |
| **Researcher** (sub-agent) | Investigates, synthesises, advises | [model] | `@researcher` |

### Delegate to `@researcher` before acting on:

- Comparing libraries, tools, or frameworks
- Looking up external service details, quotas, or SDK behaviour
- Investigating compliance or regulatory requirements
- Benchmarking or evaluating models or tools
- Any "how does X work?" question about an external system

### Handle directly (no delegation needed):

- Writing, editing, and refactoring code
- Running tests and interpreting output
- Debugging errors in existing code
- Implementing a design that has already been researched and decided

---

## Working style

1. **Give one instruction or suggestion at a time, then stop and wait.**
2. Do not proceed until the developer says `<<go>>`.
3. Explain what you are about to do and **why** before doing it.
4. If a decision needs to be made, present options and recommend one —
   then wait for `<<go>>` before implementing.
5. Keep code minimal — prototype quality unless told otherwise.

---

```

---

## B.2 docs/README.md (routing table)

```markdown
# [Project name] — Documentation

This directory is the **system of record** for [project name].
[`CLAUDE.md`](../CLAUDE.md) at the repo root points here for all
project knowledge.

---

## Overview

[Two to four paragraphs. What is this project? What problem does it
solve? Who uses it? What are the key constraints or requirements that
shape the architecture? This is the first thing a new contributor —
human or agent — reads to understand the project.]

---

## Current status

> **[Milestone name]** — [status: in progress / not started / complete]
> **Active focus:** [one sentence on what's being worked on right now]
>
> Update this section whenever the active focus shifts. Keep it to
> three lines maximum.

---

## Read this doc when your task involves…

| If the task is about… | Read… |
|---|---|
| Overall architecture, data flow, component boundaries | [`architecture.md`](architecture.md) |
| Technology choices, dependency rationale | [`tech-stack.md`](tech-stack.md) |
| [Add rows for your project's docs] | |
| Why a specific design decision was made | [`decisions/`](decisions/) |
| Past research investigations | [`/research/`](../research/) |

---

## Documentation conventions

- **Top-level docs** describe stable, long-lived project properties.
- **`milestones/`** tracks scoped goals and exit criteria per milestone.
- **`decisions/`** holds Architecture Decision Records — immutable
  records of non-obvious design choices.
- **`/research/`** at the repo root holds investigation outputs from
  the researcher sub-agent.

### Update discipline

- Update the **Current status** section whenever focus shifts.
- Update **milestone docs** when scope changes or criteria are met.
- Never edit ADRs — supersede them with new ones if decisions change.
- Significant changes to `architecture.md` or `tech-stack.md` warrant
  an ADR explaining why.
```

---

## B.3 Architecture Decision Record (ADR)

Save as `docs/decisions/NNNN-short-slug.md`:

```markdown
# NNNN — [Short title in imperative form]

**Status:** Proposed | Accepted | Superseded by [NNNN-slug]
**Date:** YYYY-MM-DD
[**Supersedes:** NNNN-slug]   ← include only if this replaces a prior ADR

---

## Context

[What is the situation that requires a decision? What constraints,
prior work, or external factors are relevant? Describe the problem,
not the solution. One to three paragraphs.]

## Decision

[What was chosen? State it plainly in one paragraph. No justification
here — that goes in Consequences.]

## Alternatives considered

- **[Alternative A]** — [why it was rejected, one to two sentences]
- **[Alternative B]** — [why it was rejected]

## Consequences

- **Positive:** [what gets easier, more correct, or newly possible]
- **Negative:** [what gets harder, what must be maintained]
- **Neutral:** [tradeoffs that are not clearly wins or losses]

## References

[Links to research outputs, PRs, external docs, or code that informed
the decision. Omit if none.]
```

**Numbering:** use four-digit zero-padded sequential numbers (`0001`, `0002`, …). Numbers are never reused, even after supersession.

**Index:** every ADR must be listed in `docs/decisions/README.md` before it is merged. The index entry format:

```markdown
| 0001 | [Title](0001-slug.md) | Accepted |
```

---

## B.4 Skill file

Save as `.claude/skills/<name>/SKILL.md`:

```markdown
---
name: [kebab-case-name]
description: >
  Use this skill when [specific task class — one sentence].
  Triggers include: "[trigger phrase 1]", "[trigger phrase 2]",
  "[trigger phrase 3]".
  Does NOT apply to [adjacent task that might false-trigger].
---

# [Skill title]

## When to use this skill

[One paragraph restating the trigger condition in slightly more detail
than the description. The agent reads this to confirm the skill was
invoked correctly before proceeding.]

## Steps

1. [First action — specific enough to execute without guessing]
2. [Second action]
3. [Continue as needed — each step is a single action]

## Gotchas

- [Non-obvious thing a capable engineer would still get wrong
  without project-specific knowledge]
- [Another gotcha — add these as you discover them in practice]

## Verification

- [How to confirm the workflow completed correctly]
- [Usually: run these tests, check these files were updated]
```

**Trigger description checklist before shipping:**
- [ ] Specific about the task class (not the domain)
- [ ] Includes two to four explicit trigger phrases
- [ ] Excludes the most likely adjacent false-trigger
- [ ] Three to five sentences maximum

**Content checklist:**
- [ ] When-to-use section confirms the trigger
- [ ] Steps are numbered and each is a single action
- [ ] Gotchas section exists (even if short — this is the high-value section)
- [ ] Verification section closes the loop

---

## B.5 Handoff document

Use when transitioning between sessions or between tools (e.g. chat to IDE):

```markdown
## Handoff — [YYYY-MM-DD]

**Project:** [name] — see [`docs/README.md`](docs/README.md) for orientation.

**Current task:**
[Specific, bounded description of what to work on next. Not "we're
working on the API" but "implement the POST /users endpoint as
described in docs/milestones/m2.md sections 3 and 4."]

**Decisions made this session:**
- [ADR reference or one-line summary of each significant decision]
- [If no decisions were made, write "none — existing ADRs apply"]

**Open questions / blockers:**
- [Anything the next session needs to resolve before proceeding]
- [If none, write "none — proceed with the current task"]

**Engagement rules:** see [`CLAUDE.md`](CLAUDE.md) — one step at a
time, wait for `<<go>>` before proceeding.
```

**What to include and exclude:**

| Include | Exclude |
|---|---|
| The specific next task | The conversation history |
| ADR references (pointer, not content) | Reasoning that led to decisions |
| Open questions | Closed questions |
| Pointers to relevant docs | Re-explanation of doc content |

The handoff should be readable in under two minutes. If it is longer, it is carrying history rather than state.

---

## B.6 docs/decisions/README.md (ADR index)

```markdown
# Architecture Decision Records

ADRs are short, immutable records of non-obvious design decisions.
Each captures the context, the decision, the alternatives considered,
and the consequences.

## When to write one

Write an ADR when:
- More than one reasonable alternative existed
- The decision affects multiple files or modules
- The decision encodes a constraint not visible from any single file
- A future contributor would otherwise ask "why is it done this way?"

## Rules

- **Immutable:** never edit an ADR after it is accepted. If a decision
  changes, write a new ADR that supersedes the old one.
- **Indexed:** every ADR in this directory must appear in the table
  below before merging.
- **Numbered:** four-digit zero-padded sequence (`0001`, `0002`, …).
  Numbers are never reused.

## Template

See [`TEMPLATE.md`](TEMPLATE.md).

## Index

| # | Title | Status |
|---|---|---|
| [0001](0001-example.md) | [Example decision title] | Accepted |
```
