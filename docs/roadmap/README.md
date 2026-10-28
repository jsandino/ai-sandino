# Roadmap

One file per phase. Current status ([`docs/README.md`](../README.md)) links
the current phase; each phase file lists its ordered steps and links the
briefs it uses.

## Rules

- A phase file is written just in time (when the previous phase nears its end).
- Files are named `phase-NNN.md` (three digits, no slug), so renaming a
  phase never breaks links.
- Each PR updates its step's status in the phase file, describing the state
  after it merges.
- Each step has a **Mode**: `gated` (Javier approves each piece) or `loop`
  (an autonomous run on its Ready brief, started only by `<<loop>>`).
  `<<next>>` in [`CLAUDE.md`](../../CLAUDE.md) acts on it.
- The PR that completes a phase's last step marks the phase Done here and in
  its file; the file then stays as the record.
- If no next phase exists, the next step is planning one.
- A stream of work on a long-lived branch is its own phase, and lives only
  on that branch: its phase file, its row here and its block in Current
  status are added there and reach `main` when it merges
  ([ADR 0017](../decisions/0017-parallel-phases.md)).

## Phases

| Phase | Title | Goal | Status |
|---|---|---|---|
| [001](phase-001.md) | Harness foundation | Context layer, PDF pipeline, CI gates, L1–L2 checks | Done |
| [002](phase-002.md) | Autonomy foundations and Site v1 | Staged autonomy up to Stage 1, and the shell, landing and topic 1 pages | Current |
