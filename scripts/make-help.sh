#!/usr/bin/env bash
#
# make-help.sh — print every Makefile target that has a "## description"
# comment. Called by `make help`.

set -euo pipefail

makefile="${1:-Makefile}"
grep -E '^[a-zA-Z0-9_-]+:.*## ' "$makefile" \
  | awk 'BEGIN { FS = ":.*## " } { printf "  \033[36m%-12s\033[0m %s\n", $1, $2 }'
