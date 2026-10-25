#!/usr/bin/env bash
#
# guides.sh — where the PDF pipeline finds guides (docs/guide-format.md).
# Sourced (not executed) by build-pdf.sh, render-diagrams.sh,
# precommit-build-pdf.sh and check-pdf-fresh.sh, after they set ROOT_DIR.
#
# A guide is a folder in src/content/ with a metadata.yml. Its chapters are
# its [0-9][0-9]-*.md files, in name order; its PDF is public/<folder>.pdf.

CONTENT_DIR="$ROOT_DIR/src/content"

# Prints every guide's folder name, one per line, in name order.
pdf_guides() {
  local meta
  for meta in "$CONTENT_DIR"/*/metadata.yml; do
    [[ -f "$meta" ]] && basename "$(dirname "$meta")"
  done
  return 0
}

# Prints a guide's chapter file names, one per line, in name order.
guide_chapters() {
  local f
  for f in "$CONTENT_DIR/$1"/[0-9][0-9]-*.md; do
    [[ -f "$f" ]] && basename "$f"
  done
  return 0
}

# Prints a remediation-grade error to stderr: guide_error <title> <rule>
# <found> <fix>.
guide_error() {
  cat >&2 <<EOF
$1
  Rule:  $2
  Found: $3
  Fix:   $4
EOF
}
