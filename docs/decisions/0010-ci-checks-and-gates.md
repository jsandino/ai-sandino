# 0010 — CI checks and their gates

**Status:** Accepted
**Date:** 2026-10-08

---

## Context

`main` is protected (ADR 0004), but until now nothing checked a PR except the
local hooks and Cloudflare's preview build. The kickoff called for three CI
checks (build, link checker, Lighthouse CI), and ADR 0002 needs a backstop
for PDF changes that skip the pre-commit hook. Every check must run through
`make` (ADR 0005), and the guide warns that a noisy check is worse than none.
Tool choices were researched in `research/0002` and `research/0003`.

## Decision

A GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every PR to
`main`, with two jobs that are both required to merge:

- **`site`:** `make ci`, then `make build`, `make linkcheck` and
  `make lighthouse`, in that order. They share the built `dist/`.
  - **Links:** internal links and anchors only. `hyperlink` checks `dist/`
    and `remark-validate-links` checks the repo's Markdown. External links
    are not checked.
  - **Lighthouse:** `@lhci/cli` on the **mobile** form factor (the site is
    mobile-first), median of 3 runs. It fails below 0.95 for accessibility,
    best practices and SEO, or below 0.90 for performance. Reports are saved
    as a workflow artifact and never uploaded to public storage.
- **`pdf`:** `make pdf-check` compares commit **order** (not timestamps):
  it fails if any commit touching the guide source or chapter order comes
  after the last PDF rebuild.

All checking tools are pinned npm devDependencies, so local and CI versions
match.

## Alternatives considered

- **lychee for links:** checks HTML and Markdown in one tool, but it's a
  binary with no npm install route, so local and CI versions could differ.
- **Checking external links on every PR:** fails for reasons unrelated to the
  PR (outages, rate limits), which trains everyone to ignore the check.
- **Desktop Lighthouse preset:** easier to pass, but it doesn't match the
  mobile-first principle.
- **Lighthouse public report storage:** convenient links, but it publishes
  reports outside GitHub.
- **PDF check by commit timestamps:** rebase merges rewrite dates, so the
  result would be wrong.
- **One job per check:** clearer names, but each would repeat the install
  and the build.

## Consequences

- **Positive:** every PR is built, link-checked and audited before it can
  merge; a failure is always reproducible with the same `make` command.
- **Negative:** Lighthouse adds about a minute per page, and its runtime
  grows with page count. Performance scores can vary on CI machines. If that
  causes failures, adjust the setting (runs or threshold) rather than ignore
  them.
- **Neutral:** external links are not checked at all. An occasional
  scheduled report could cover them later if needed.
