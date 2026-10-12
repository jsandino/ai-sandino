#!/usr/bin/env bash
#
# typecheck.sh — run `astro check` on the whole project. Called by
# `make typecheck` and the Lefthook pre-commit hook. astro check takes no
# file list: types cross files, so it always checks everything.
# TypeScript is pinned to 6.x: docs/decisions/0011-pin-typescript-6.md.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
BIN="$ROOT_DIR/node_modules/.bin"

if ! "$BIN/astro" check --minimumFailingSeverity warning; then
  cat >&2 <<'MSG'

TYPE ERRORS
  Rule: code passes astro check (strict TypeScript, tsconfig.json) with no
        errors or warnings, so type mistakes are caught before review.
  Fix:  correct each problem listed above (file:line:col). Re-run with
        make typecheck. Don't loosen tsconfig.json or add @ts-ignore to
        pass; if a type is genuinely unknowable, use @ts-expect-error
        with a comment saying why.
MSG
  exit 1
fi
