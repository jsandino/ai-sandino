#!/usr/bin/env bash
#
# test-e2e.sh — run the Playwright end-to-end tests in tests/e2e/ against
# `astro preview` of the built dist/. Called by `make test-e2e`; CI only,
# not a hook, because it needs a build and a browser.
# Rationale: docs/decisions/0013-test-layers.md.
#
# GREP=<pattern> (from `make test-e2e GREP=…`) runs only the tests whose
# title matches, via Playwright's -g. Empty: the whole suite.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
BIN="$ROOT_DIR/node_modules/.bin"

if [[ ! -d dist ]]; then
  cat >&2 <<'MSG'
E2E TESTS: dist/ NOT FOUND
  Rule: end-to-end tests run against the built site, so it must be built
        first.
  Fix:  make build && make test-e2e
MSG
  exit 1
fi

args=(test)
if [[ -n "${GREP:-}" ]]; then
  args+=(-g "$GREP")
fi

if ! "$BIN/playwright" "${args[@]}"; then
  cat >&2 <<'MSG'

E2E TESTS FAILED
  Rule: every test in tests/e2e/ passes against the built site, including
        zero axe violations at WCAG 2.2 AA, so a broken or inaccessible
        page never merges.
  Fix:  the failing test and its error are listed above. For an axe
        failure, each violation shows its rule id, the offending nodes and
        a help URL. If the browser is missing, run make browsers first.
        In CI, open the "playwright-report" artifact on the workflow run.
        Fix the cause, rebuild and re-run: make build && make test-e2e
        Don't delete, skip or weaken a test to pass.
MSG
  exit 1
fi
