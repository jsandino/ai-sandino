#!/usr/bin/env bash
#
# lint.sh — run ESLint. Called by `make lint`, `make lint-fix` and the
# Lefthook pre-commit hook. Rules and ignores: eslint.config.mjs.
#
#   lint.sh check          -> fail on any lint error (CI)
#   lint.sh fix [file...]  -> apply auto-fixes, fail on what remains
#                             (default: whole repo)

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
BIN="$ROOT_DIR/node_modules/.bin"

mode="${1:-}"
shift || true

# Ignored paths passed explicitly by the hook are skipped, not reported.
FLAGS=(--max-warnings 0 --no-warn-ignored)

case "$mode" in
  check) args=(.) ;;
  fix)
    args=(--fix "$@")
    if [[ $# -eq 0 ]]; then args=(--fix .); fi
    ;;
  *) echo "lint.sh: unknown mode '$mode' (expected check or fix)" >&2; exit 1 ;;
esac

if ! "$BIN/eslint" "${FLAGS[@]}" "${args[@]}"; then
  cat >&2 <<'MSG'

LINT ERRORS
  Rule: code passes ESLint (eslint.config.mjs) with no errors or warnings,
        so likely bugs are caught before review.
  Fix:  correct each problem listed above (file:line, rule name). Run
        make lint-fix to apply the automatic fixes first. If a rule is
        wrong for one line, disable it there with a comment saying why:
        // eslint-disable-next-line <rule> -- <reason>
MSG
  exit 1
fi
