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
| [0008](0008-karpathy-tokenizer-citation.md) | Karpathy's "Let's build the GPT Tokenizer": citation check | 2026-11-03 | Current |
| [0009](0009-text-sources-tokenization-embeddings.md) | Text sources for tokenization and embedding claims | 2026-11-03 | Current |
| [0010](0010-tied-embeddings-bias-model-numbers.md) | Tied embeddings, bias terms and model numbers: fact-check | 2026-11-03 | Current |
| [0011](0011-positional-encoding-fact-check.md) | Positional-encoding fact-check | 2026-11-04 | Current |
| [0012](0012-multi-head-attention-fact-check.md) | Multi-head attention fact-check | 2026-11-10 | Current |
| [0013](0013-causal-masking-fact-check.md) | Causal masking fact-check | 2026-11-13 | Current |
| [0014](0014-feed-forward-network-fact-check.md) | Feed-forward network fact-check | 2026-11-14 | Current |
| [0015](0015-residuals-and-normalization-fact-check.md) | Residuals and normalization fact-check | 2026-11-17 | Current |
| [0016](0016-model-size-table-check.md) | Model size table check | 2026-11-17 | Current |
| [0017](0017-output-processing-fact-check.md) | Output processing fact-check | 2026-11-19 | Current |
