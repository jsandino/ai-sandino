#!/usr/bin/env bash
#
# lighthouse.sh — audit the built site with Lighthouse CI. Called by
# `make lighthouse`. Settings and score thresholds live in lighthouserc.json;
# reports are written to .lighthouseci/ (never uploaded anywhere).
# Rationale: docs/decisions/0010-ci-checks-and-gates.md.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -d dist ]]; then
  cat >&2 <<'MSG'
LIGHTHOUSE: dist/ NOT FOUND
  Rule: Lighthouse audits the built site, so it must be built first.
  Fix:  make build && make lighthouse
MSG
  exit 1
fi

rm -rf .lighthouseci
if ! "$ROOT_DIR/node_modules/.bin/lhci" autorun; then
  cat >&2 <<'MSG'

LIGHTHOUSE SCORE BELOW THRESHOLD
  Rule: every page must score >= 0.95 for accessibility, best practices and
        SEO, and >= 0.90 for performance (mobile, median of 3 runs), so the
        site stays fast and accessible as it grows.
  Fix:  the failing page, category and audits are listed above. Open the
        HTML reports in .lighthouseci/ for details (in CI: the
        "lighthouse-reports" artifact on the workflow run), fix the cause,
        rebuild and re-run: make build && make lighthouse
        If a performance failure looks like runner noise rather than a real
        regression, re-run once before changing anything.
MSG
  exit 1
fi
