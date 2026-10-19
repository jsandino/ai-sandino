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

  - **Date:** YYYY-MM-DD
  - **Status:** Current | Superseded by NNNN-slug
  - **Question:** <the question that was researched>

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
| [0002](0002-link-checking.md) | Internal link and anchor checking in CI | 2026-10-08 | Current |
| [0003](0003-lighthouse-ci.md) | Lighthouse CI for the static build, without public upload | 2026-10-08 | Current |
| [0004](0004-lint-format-typecheck.md) | Formatting, linting and type checking for Astro 7 + Tailwind v4 | 2026-10-11 | Current |
| [0005](0005-ralph-loop.md) | Huntley's loop ("Ralph") and headless Claude Code | 2026-10-14 | Current |
| [0006](0006-test-layers.md) | Unit and end-to-end test layers for a static Astro 7 site | 2026-10-16 | Current |
| [0007](0007-social-preview-image.md) | Social preview images (og:image) for the shared shell | 2026-10-18 | Current |
