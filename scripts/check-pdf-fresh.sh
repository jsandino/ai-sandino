#!/usr/bin/env bash
#
# check-pdf-fresh.sh — CI backstop for the PDF pre-commit hook. Called by
# `make pdf-check`. For every guide (scripts/pdf/guides.sh), fails if a
# commit touching src/content/<guide>/ comes after the last commit that
# changed public/<guide>.pdf, e.g. a source change committed with
# --no-verify. Also checks every guide against the content rules
# (scripts/pdf/content-check.mjs), so CI enforces them on every PR.
#
# Compares commit ORDER (ancestry), not timestamps: rebase merges rewrite
# commit dates, and git does not track file mtimes.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
# shellcheck source=pdf/guides.sh
source "$ROOT_DIR/scripts/pdf/guides.sh"

if [[ "$(git rev-parse --is-shallow-repository)" == "true" ]]; then
  cat >&2 <<'MSG'
PDF CHECK: SHALLOW CLONE
  Rule: this check compares commit history, so it needs the full history.
  Fix:  in CI, check out with full history (actions/checkout: fetch-depth: 0).
        Locally: git fetch --unshallow
MSG
  exit 1
fi

# Returns 0 if the guide's PDF is up to date with its source.
check_guide() {
  local g="$1"
  local src="src/content/$g"
  local pdf="public/$g.pdf"
  local src_commit pdf_commit

  src_commit="$(git log -1 --format=%H -- "$src")"
  pdf_commit="$(git log -1 --format=%H -- "$pdf")"

  if [[ -z "$src_commit" ]]; then
    echo "PDF check: $g has no source in history; nothing to check."
    return 0
  fi

  if [[ -n "$pdf_commit" ]] && git merge-base --is-ancestor "$src_commit" "$pdf_commit"; then
    echo "PDF check: $pdf is up to date with its source."
    return 0
  fi

  cat >&2 <<MSG
STALE PDF: $g
  File: $pdf
  Rule: the committed PDF must be rebuilt whenever the guide source in
        $src/ changes, so the downloadable guide never lags the Markdown
        it is built from. (The pre-commit hook normally does this; it was
        skipped or bypassed.)
  Found: guide changes committed after the PDF was last rebuilt:
$(git log --format='         %h %s' "${pdf_commit:+$pdf_commit..}HEAD" -- "$src")
  Fix:  make pdf GUIDE=$g
        git add $pdf && git commit -m "build: rebuild the $g PDF"
        Tools needed: docs/prerequisites.md
MSG
  return 1
}

failed=0
while IFS= read -r g; do
  node scripts/pdf/content-check.mjs "src/content/$g" || failed=1
  check_guide "$g" || failed=1
done < <(pdf_guides)
exit "$failed"
