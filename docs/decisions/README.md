# Architecture Decision Records

ADRs are short, immutable records of non-obvious decisions. Each one captures
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

- **Immutable.** Never edit an ADR after it is accepted. If a decision
  changes, write a new ADR that supersedes it, and change only the old one's
  **Status** line to `Superseded by NNNN-slug`.
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
| [0007](0007-hand-written-topic-pages.md) | Write topic pages by hand, using the guide as a reference | Accepted (provisional) |
| [0008](0008-flat-urls-and-topics-data.md) | Use flat URLs, with `topics.ts` as the single source | Accepted |
| [0009](0009-visual-language.md) | Base the visual language on the AI Dev reference | Accepted |
