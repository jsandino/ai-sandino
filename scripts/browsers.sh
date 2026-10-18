#!/usr/bin/env bash
#
# browsers.sh — install the browser the end-to-end tests use: Chromium's
# headless shell only, at the version @playwright/test is locked to.
# Called by `make browsers`. In CI it also installs Chromium's OS
# dependencies (apt), which can't be cached, so there is no browser cache.
# Rationale: docs/decisions/0013-test-layers.md.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
BIN="$ROOT_DIR/node_modules/.bin"

args=(install --only-shell chromium)
if [[ -n "${CI:-}" ]]; then
  args+=(--with-deps)
fi

"$BIN/playwright" "${args[@]}"
