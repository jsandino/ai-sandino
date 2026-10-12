#!/usr/bin/env bash
#
# format.sh — run Prettier. Called by `make format`, `make format-check` and
# the Lefthook pre-commit hook. Scope and exclusions: .prettierignore.
#
#   format.sh write [file...]   -> rewrite the files (default: whole repo)
#   format.sh check             -> fail if any file is not formatted (CI)

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
BIN="$ROOT_DIR/node_modules/.bin"

mode="${1:-}"
shift || true

# Skip files Prettier has no parser for, and ignored paths passed explicitly.
FLAGS=(--ignore-unknown --no-error-on-unmatched-pattern --log-level warn)

case "$mode" in
  write)
    if [[ $# -eq 0 ]]; then set -- .; fi
    "$BIN/prettier" --write "${FLAGS[@]}" "$@"
    ;;
  check)
    if ! "$BIN/prettier" --check "${FLAGS[@]}" .; then
      cat >&2 <<'MSG'

FILES NOT FORMATTED
  Rule: code and config follow Prettier (prettier.config.mjs), so diffs
        show only real changes. The pre-commit hook formats staged files.
  Fix:  make format, then commit the result. Files listed above are the
        ones that differ. To exclude a path on purpose, add it to
        .prettierignore with a comment saying why.
MSG
      exit 1
    fi
    ;;
  *) echo "format.sh: unknown mode '$mode' (expected write or check)" >&2; exit 1 ;;
esac
