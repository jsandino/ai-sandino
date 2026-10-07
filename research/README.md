# Research

Summaries returned by the `researcher` sub-agent (`.claude/agents/researcher.md`),
kept so the project never re-investigates a question it has already answered.
**Check the index below before delegating a research question.**

## Conventions

- **Numbered like ADRs:** `NNNN-<slug>.md`, four digits, zero-padded and
  sequential. Numbers are never reused.
- **Header:** every file starts with this block, followed by the researcher's
  structured summary as returned:

  ```markdown
  # NNNN — <Title>

  **Date:** YYYY-MM-DD
  **Status:** Current | Superseded by NNNN-slug
  **Question:** <the question that was researched>

  ---
  ```

- **Snapshots, not living docs.** If a summary goes stale, write a new one
  that says "Supersedes NNNN" in its header, and change only the old one's
  **Status** line.
- **Indexed:** every summary appears in the table below in the same commit
  that adds it.

## Index

| # | Title | Date | Status |
|---|---|---|---|
| [0001](0001-pr-description-template.md) | PR description templates and Conventional Commit PR titles | 2026-10-07 | Current |
