# 0017 — Run parallel streams of work as separate phases

- **Status:** Accepted
- **Date:** 2026-10-28

---

## Context

The roadmap assumes one stream of work: one Current phase, its steps in
order, and short-lived branches that each merge to `main` before the next
starts ([ADR 0004](0004-branch-pr-workflow.md)). `<<next>>` reads the one
Next step from Current status in [`docs/README.md`](../README.md).

Importing the transformers guide breaks that assumption. It is done one
source page at a time, on one long-lived branch (`feat/transformers-guide`)
that merges to `main` only when the guide is complete. Meanwhile, harness
work carries on in short-lived branches that merge regularly. Both streams
would update their phase file and Current status, so if they share
`phase-002.md`, the long-lived branch conflicts with every harness merge,
and its step numbers collide with the ones added on `main`.

## Decision

A stream of work on a long-lived branch is its own phase, and that phase
lives only on its branch. The branch adds the phase file, its row in the
phase index and its own block in Current status, below the one for `main`'s
phase, with a blank line between them so that updates on either side never
touch neighbouring lines. All of it reaches `main` when the branch merges,
by which time the phase is Done. `main` only ever shows its own phase, so it
is never stale about work it doesn't have yet. On the long-lived branch,
`<<next>>` acts on the branch's phase.

A long-lived branch picks up `main` by rebasing while it has never been
pushed, and by merging `main` in once it has, so it never needs a
force-push.

For now: phase 002 stays on `main`, worked on short-lived branches, and its
step 11 moves to a new phase 003, *Transformers guide*, on
`feat/transformers-guide`.

## Alternatives considered

- **Both streams in `phase-002.md`, consolidated at merge:** every harness
  merge conflicts with the long-lived branch on the same table and status
  lines, and the steps added on each side collide in numbering.
- **The long-lived phase also on `main`, with a line per phase in Current
  status:** `main` would show the phase's status as it was when the phase
  was set up, which is stale as soon as the branch moves on.
- **One stream at a time:** no conflicts, but harness fixes wait for the
  whole guide import, or the import stops for each fix.

## Consequences

- **Positive:** the streams don't conflict, and each branch shows the true
  status of its own work. `main` keeps one phase and one Next step.
- **Negative:** `main` doesn't show the long-lived stream's progress; only
  its branch does. A long-lived branch drifts from `main` unless it picks
  up `main` regularly.
- **Neutral:** phase numbers no longer imply order in time: phase 003 can
  finish before phase 002.
