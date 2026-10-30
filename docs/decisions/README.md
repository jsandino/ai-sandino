# Architecture Decision Records

ADRs are short records of non-obvious decisions. Each one captures
the context, the decision, the alternatives considered and the consequences.

## When to write one

Write an ADR when:
- more than one reasonable alternative existed;
- the decision affects several files or modules;
- the decision encodes a constraint not visible from any single file;
- a future contributor would otherwise ask "why is it done this way?"

Write it **before** implementing. Smaller choices with no serious alternative
belong in the relevant doc, not here.

## Rules

- **Superseded, not rewritten.** If a decision changes, write a new ADR that
  supersedes it, and change only the old one's **Status** line to
  `Superseded by NNNN-slug`. If the new ADR replaces only part of the old
  one, the old Status line becomes
  `Accepted; <part> superseded by NNNN-slug` instead.
- **Indexed.** Every ADR appears in the table below before it is merged.
- **Numbered.** Four-digit, zero-padded, sequential (`0001`, `0002`, …).
  Numbers are never reused.

## Template

See [`TEMPLATE.md`](TEMPLATE.md).

## Index

| # | Title | Status |
|---|---|---|
| [0001](0001-lefthook-for-git-hooks.md) | Use Lefthook for git hooks | Accepted |
| [0002](0002-commit-pdf-rebuild-in-hook.md) | Commit the built PDF and rebuild it in a pre-commit hook | Accepted |
| [0003](0003-vanilla-motion-no-react.md) | Use vanilla Motion, no React | Accepted |
| [0004](0004-branch-pr-workflow.md) | Every change goes through a branch, a PR and a protected `main` | Accepted |
| [0005](0005-make-command-interface.md) | Use make as the only command interface | Accepted |
| [0006](0006-defer-web-mermaid.md) | Put off rendering Mermaid on the web | Accepted |
| [0007](0007-hand-written-topic-pages.md) | Write topic pages by hand, using the guide as a reference | Superseded by 0018 |
| [0008](0008-flat-urls-and-topics-data.md) | Use flat URLs, with `topics.ts` as the single source | Accepted |
| [0009](0009-visual-language.md) | Base the visual language on the AI Dev reference | Accepted; theme clause superseded by 0015 |
| [0010](0010-ci-checks-and-gates.md) | CI checks and their gates | Accepted |
| [0011](0011-pin-typescript-6.md) | Pin TypeScript to 6.x while `astro check` needs it | Accepted |
| [0012](0012-staged-agent-autonomy.md) | Adopt agent autonomy in stages | Accepted |
| [0013](0013-test-layers.md) | Test layers: Vitest for units, Playwright with axe end to end | Accepted |
| [0014](0014-file-format-no-trailing-slash.md) | Build pages as files, with no trailing slash | Accepted |
| [0015](0015-dark-default-theme-toggle.md) | Default to dark, with a remembered theme toggle | Accepted |
| [0016](0016-guide-format-and-generic-pdf-pipeline.md) | Define one guide format, and build every guide's PDF from it | Accepted |
| [0017](0017-parallel-phases.md) | Run parallel streams of work as separate phases | Accepted |
| [0018](0018-topic-page-content-sources.md) | Let topic pages draw their content from the guide, by any means | Accepted |
