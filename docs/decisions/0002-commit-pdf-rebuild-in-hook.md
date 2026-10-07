# 0002 — Commit the built PDF and rebuild it in a pre-commit hook

**Status:** Accepted
**Date:** 2026-10-02

---

## Context

Each topic offers a companion PDF built from Markdown with pandoc, xelatex
and the Mermaid CLI. Cloudflare's build image has none of these, and
installing a LaTeX toolchain on every deploy is slow and fragile. A committed
PDF, however, can quietly fall behind its source. A full build takes about
10–13 seconds. Recorded after implementation (PR #1).

## Decision

Build the PDF **locally** and **commit** it to `public/`. A Lefthook
pre-commit hook (`scripts/precommit-build-pdf.sh`) runs only when guide
source is staged. It rebuilds and stages the PDF, unless a staged PDF is
already newer than every staged source file. A CI check comparing commit
history is the backstop for commits that skip the hook.

## Alternatives considered

- **Build in CI or on deploy:** always in step with the source, but it puts
  LaTeX on every run, adds minutes, and is fragile.
- **A hook that only fails and asks you to rebuild:** simpler, but it leaves
  a step for someone to remember, which is the kind of written rule that
  drifts.
- **Hook with no skip condition:** rebuilds needlessly when you've already
  built the PDF.

## Consequences

- **Positive:** the downloadable PDF never lags its source; commits that
  don't touch the guide pay nothing; deploys stay fast.
- **Negative:** committing to the guide needs the PDF toolchain installed;
  every rebuild adds a binary to git history (PDFs embed timestamps).
- **Neutral:** a chapter that doesn't build can't be committed without
  `--no-verify`, and the CI backstop then flags the stale PDF.
