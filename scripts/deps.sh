#!/usr/bin/env bash
#
# deps.sh — add or remove npm dependencies. Called by `make install`,
# `make dev-install` and `make uninstall` so the Makefile stays a list of
# plain aliases (see docs/development.md#make).
#
#   deps.sh install     <pkg>...   -> npm install <pkg>...
#   deps.sh dev-install <pkg>...   -> npm install -D <pkg>...
#   deps.sh uninstall   <pkg>...   -> npm uninstall <pkg>...

set -euo pipefail

cmd="${1:-}"
shift || true

if [[ $# -eq 0 ]]; then
  cat >&2 <<MSG
MISSING PACKAGE NAME
  Rule: 'make $cmd' changes package.json and package-lock.json, so it needs
        the package(s) to act on. Run without one, npm would instead
        re-resolve every dependency and could rewrite the lockfile.
  Fix:  make $cmd PKG=<name>          e.g. make $cmd PKG=motion
        make $cmd PKG="<a> <b>@1.2"   for several packages or a version
        To install the project's locked dependencies, run: make ci
MSG
  exit 1
fi

case "$cmd" in
  install)     npm install "$@" ;;
  dev-install) npm install -D "$@" ;;
  uninstall)   npm uninstall "$@" ;;
  *) echo "deps.sh: unknown command '$cmd' (expected install, dev-install or uninstall)" >&2; exit 1 ;;
esac
