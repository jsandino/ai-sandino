#!/usr/bin/env bash
#
# check-pdf-fresh.sh — CI backstop for the PDF pre-commit hook. Called by
# `make pdf-check`. Fails if any commit touching the guide source (or its
# chapter order) comes after the last commit that rebuilt the PDF, e.g. a
# source change committed with --no-verify.
#
# Compares commit ORDER (ancestry), not timestamps: rebase merges rewrite
# commit dates, and git does not track file mtimes.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

SOURCES=(src/content/harness-guide scripts/guide-files.sh)
PDF="public/harness-guide.pdf"

if [[ "$(git rev-parse --is-shallow-repository)" == "true" ]]; then
  cat >&2 <<'MSG'
PDF CHECK: SHALLOW CLONE
  Rule: this check compares commit history, so it needs the full history.
  Fix:  in CI, check out with full history (actions/checkout: fetch-depth: 0).
        Locally: git fetch --unshallow
MSG
  exit 1
fi

src_commit="$(git log -1 --format=%H -- "${SOURCES[@]}")"
pdf_commit="$(git log -1 --format=%H -- "$PDF")"

if [[ -z "$src_commit" ]]; then
  echo "PDF check: no guide source in history; nothing to check."
  exit 0
fi

if [[ -n "$pdf_commit" ]] && git merge-base --is-ancestor "$src_commit" "$pdf_commit"; then
  echo "PDF check: $PDF is up to date with its source."
  exit 0
fi

cat >&2 <<MSG
STALE PDF
  File: $PDF
  Rule: the committed PDF must be rebuilt whenever the guide source or its
        chapter order changes, so the downloadable guide never lags the
        Markdown it is built from. (The pre-commit hook normally does this;
        it was skipped or bypassed, or the chapter order changed.)
  Found: guide changes committed after the PDF was last rebuilt:
$(git log --format='         %h %s' "${pdf_commit:+$pdf_commit..}HEAD" -- "${SOURCES[@]}")
  Fix:  make pdf
        git add $PDF && git commit -m "build: rebuild harness guide PDF"
        Tools needed: docs/prerequisites.md
MSG
exit 1
