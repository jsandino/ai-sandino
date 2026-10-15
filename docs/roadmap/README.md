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
- The PR that completes a phase's last step marks the phase Done here and in
  its file; the file then stays as the record.
- If no next phase exists, the next step is planning one.

## Phases

| Phase | Title | Goal | Status |
|---|---|---|---|
| [001](phase-001.md) | Harness foundation | Context layer, PDF pipeline, CI gates, L1–L2 checks | Done |
| [002](phase-002.md) | Autonomy foundations and Site v1 | Staged autonomy up to Stage 1, and the shell, landing and topic 1 pages | Current |
