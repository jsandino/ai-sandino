# 0005 — Use make as the only command interface

**Status:** Accepted
**Date:** 2026-10-07

---

## Context

Commands are run by a human, by an agent and by CI. If each calls tools
differently (npm scripts here, raw `npx` there, different flags in CI), what
passes locally may not be what CI runs. The project already used a Makefile
for the PDF pipeline.

## Decision

Every command (run, build, check and dependency changes) is a `make` target,
used identically locally and in CI. Targets mirror the underlying tool's
names (`make ci`, `make install PKG=x`, `make dev-install PKG=x`,
`make uninstall PKG=x`). Recipes are one-line aliases; any logic (such as
guards and conditionals) goes into a bash script in `scripts/`. `make help`
lists the targets. A Claude Code permission rule blocks agents from calling
npm or npx directly.

## Alternatives considered

- **npm scripts:** standard in JS projects, but they can't wrap dependency
  changes cleanly, and they tie the interface to npm.
- **make for running things, npm directly for dependencies:** rejected for
  consistency. One interface, no exceptions.
- **Logic inside Makefile recipes:** harder to read and test, and poor at
  error messages.

## Consequences

- **Positive:** one interface for everyone; swapping npm for another package
  manager changes only the Makefile; scripts carry clear error messages.
- **Negative:** a wrapper even where it adds nothing; arguments must be
  passed as `PKG=…`; rarely used npm commands need a target the first time
  they're used.
