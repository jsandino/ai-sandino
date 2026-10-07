# 0001 — Use Lefthook for git hooks

**Status:** Accepted
**Date:** 2026-10-01

---

## Context

The harness relies on pre-commit checks: the same check is cheaper to fix
when it fails before a commit than when it fails in CI. The guide's examples
use the Python `pre-commit` framework, but this is a Node project, and every
later check (format, lint, types, project checks, the PDF rebuild) hangs off
whichever hook runner we pick. Recorded after implementation (PR #1).

## Decision

Use **Lefthook**, installed as an npm dev dependency, with every hook defined
in one file, `lefthook.yml`.

## Alternatives considered

- **Husky + lint-staged:** the most common JS pairing, but two tools whose
  config is split between `.husky/` scripts and `package.json`. Harder to
  read in one go.
- **Python `pre-commit`:** exactly what the guide uses, but it adds a Python
  dependency and a manual `pip install` step to a Node project.

## Consequences

- **Positive:** one file shows every check; installs automatically with the
  project's dependencies; fast; supports `glob` scoping and parallel runs.
- **Negative:** a smaller ecosystem than Husky's; hook logic beyond one line
  needs a script in `scripts/`.
- **Neutral:** Lefthook also installs a `prepare-commit-msg` stub, which does
  nothing unless configured.
