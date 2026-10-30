#!/usr/bin/env bash
#
# linkcheck.sh — check INTERNAL links and #anchors. Called by `make linkcheck`.
#
#   1. Built site:  hyperlink checks every link and anchor in dist/.
#   2. Markdown:    remark-validate-links checks the repo's docs.
#
# External links are never checked: they fail for reasons unrelated to the
# change under review (outages, rate limits), which would make this check
# noisy. Rationale: docs/decisions/0010-ci-checks-and-gates.md.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
BIN="$ROOT_DIR/node_modules/.bin"

# Markdown checked for links. The guide source (src/content/) is excluded:
# it is print-only, and its cross-file links are rewritten by the PDF build.
MARKDOWN=(README.md CLAUDE.md docs research)

if [[ ! -d dist ]]; then
  cat >&2 <<'MSG'
LINK CHECK: dist/ NOT FOUND
  Rule: links are checked in the built site, so it must be built first.
  Fix:  make build && make linkcheck
MSG
  exit 1
fi

status=0

# The site is built as <slug>.html and served at /<slug> (docs/decisions/0014),
# but hyperlink resolves /<slug> only to <slug>/index.html. Check a copy where
# each page is also present at <slug>/index.html, so slash-less links resolve
# as they do in production.
SERVED="$(mktemp -d)"
trap 'rm -rf "$SERVED"' EXIT
cp -R dist/. "$SERVED"
while IFS= read -r page; do
  slug="${page%.html}"
  mkdir -p "$SERVED/$slug"
  cp "$SERVED/$page" "$SERVED/$slug/index.html"
done < <(cd dist && find . -name '*.html' ! -name 'index.html' | sed 's|^\./||')

echo "Checking links and anchors in dist/ ..."
if ! "$BIN/hyperlink" "$SERVED" --check-anchors; then
  status=1
  cat >&2 <<'MSG'

BROKEN LINK IN THE BUILT SITE
  Rule: every internal link and #anchor in dist/ must resolve, so visitors
        never hit a 404 or a dead jump link.
  Fix:  find the page and link reported above, then correct the href or add
        the missing page / id in src/. Rebuild and re-run: make build && make linkcheck
MSG
fi

echo "Checking links and anchors in Markdown: ${MARKDOWN[*]} ..."
if ! "$BIN/remark" "${MARKDOWN[@]}" --quiet --frail --no-stdout; then
  status=1
  cat >&2 <<'MSG'

BROKEN LINK IN THE DOCS
  Rule: every relative link and #heading anchor in the repo's Markdown must
        resolve. CLAUDE.md and docs/ route agents by link, so a broken one
        silently strands the next session.
  Fix:  correct the path or anchor reported above (file:line). Anchors use
        GitHub-style heading slugs, e.g. "## Where to look" -> #where-to-look.
MSG
fi

exit "$status"
