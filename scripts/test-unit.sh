#!/usr/bin/env bash
#
# test-unit.sh — run the Vitest unit tests in tests/unit/. Called by
# `make test-unit` and the Lefthook pre-commit hook. Always runs the whole
# suite: a change in one file can break a test of another.
# Rationale: docs/decisions/0013-test-layers.md.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
BIN="$ROOT_DIR/node_modules/.bin"

if ! "$BIN/vitest" run; then
  cat >&2 <<'MSG'

UNIT TESTS FAILED
  Rule: every unit test in tests/unit/ passes, so a broken component or
        page is caught before it is committed.
  Fix:  read the failing test and its diff above, fix the code (or the
        test, if the behaviour change is intended), then re-run with
        make test-unit. Don't delete, skip or weaken a test to pass.
MSG
  exit 1
fi
