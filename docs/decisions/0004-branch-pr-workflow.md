# 0004 — Every change goes through a branch, a PR and a protected `main`

**Status:** Accepted
**Date:** 2026-10-02

---

## Context

Cloudflare Pages deploys every push to `main` straight to production, while
CI runs on pull requests. Anything pushed directly to `main` would skip CI
and go live unchecked. Most changes are made by an AI coding agent, so the
human approval point needs to be explicit.

## Decision

Every change goes on a feature branch (`feat/`, `fix/`, `chore/`, `docs/`)
and reaches `main` only by merging a PR. `main` is protected: no direct
pushes, and CI must pass before merging. The agent opens PRs; Javier reviews
and merges (rebase merge). This is the guide's "gated" autonomy level.

## Alternatives considered

- **Push directly to `main`:** faster, but skips every check except the
  local hooks, and the CI would never run.
- **PRs for code, direct pushes for small doc fixes:** brings back a judgment
  call ("what counts as small?"), which drifts.

## Consequences

- **Positive:** every change gets CI and a Cloudflare preview before it goes
  live; the merge is a clear human approval point.
- **Negative:** small fixes carry PR overhead.
- **Neutral:** branch protection is a GitHub setting, applied by hand (see
  `docs/development.md`).
