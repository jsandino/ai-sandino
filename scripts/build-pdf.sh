#!/usr/bin/env bash
#
# build-pdf.sh — Step 2 of the PDF pipeline.
#
# Converts the pre-rendered body (cover page included, as build/rendered/
# cover.md) to build/harness.pdf in a single pandoc + xelatex pass. One pass
# means hyperref resolves every intra-document link; there is no PDF merge
# step to strip the destination table.
#
# Run scripts/render-diagrams.sh first: this script consumes build/rendered/.
#
# Requires: xelatex, pandoc. This script never installs anything; it only
# reports what is missing.

set -euo pipefail

# --- Locations -----------------------------------------------------------
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILD_DIR="$ROOT_DIR/build"
RENDERED_DIR="$BUILD_DIR/rendered"

FINAL_PDF="$BUILD_DIR/harness.pdf"
PUBLISHED_PDF="$ROOT_DIR/public/harness-guide.pdf"   # served by the site; committed

# --- Guide file order (shared with render-diagrams.sh) ----------------
# shellcheck source=guide-files.sh
source "$ROOT_DIR/scripts/guide-files.sh"
FILES=("${GUIDE_FILES[@]}")

# --- Dependency checks (fail early, never install) ---------------------
missing=0

if ! command -v xelatex >/dev/null 2>&1; then
  cat >&2 <<'EOF'
ERROR: xelatex not found on PATH.
  Install MacTeX:   brew install --cask mactex-no-gui
  (then restart your shell so /Library/TeX/texbin is on PATH)
EOF
  missing=1
fi

if ! command -v pandoc >/dev/null 2>&1; then
  cat >&2 <<'EOF'
ERROR: pandoc not found on PATH.
  Install it:       brew install pandoc
EOF
  missing=1
fi

if [[ "$missing" -ne 0 ]]; then
  echo "" >&2
  echo "Install the tool(s) above and re-run 'make pdf'." >&2
  exit 1
fi

# --- Preconditions -----------------------------------------------------
if [[ ! -d "$RENDERED_DIR" ]]; then
  echo "ERROR: $RENDERED_DIR not found. Run scripts/render-diagrams.sh first." >&2
  exit 1
fi

for name in "${FILES[@]}"; do
  if [[ ! -f "$RENDERED_DIR/$name" ]]; then
    echo "ERROR: missing pre-rendered file: $RENDERED_DIR/$name" >&2
    echo "       Re-run scripts/render-diagrams.sh." >&2
    exit 1
  fi
done

mkdir -p "$BUILD_DIR"

# --- Convert (cover + body, one pass) ---------------------------------
echo "Converting Markdown -> $FINAL_PDF"

# Run from build/rendered/ so the ./<name>-N.pdf diagram paths resolve.
#   +smart            : straighten quotes/dashes into typographic forms
#                       (a raw " in LaTeX renders as a closing quote)
#   +tex_math_dollars : render the $\rightarrow$ / $\leftarrow$ that
#                       render-diagrams.sh substituted for glyphs the
#                       body fonts lack (source has no literal $)
#   +raw_attribute    : honour the ```{=latex} blocks in cover.md and
#                       pagebreak.md (gfm disables this extension by default)
#
# title-meta/author-meta set the PDF's /Title and /Author metadata fields
# (via hyperref's pdftitle/pdfauthor) without touching the rendered page —
# unlike pandoc's "title"/"author" metadata fields, which would trigger
# the template's \maketitle and print a second title block. Fixed here in
# the script rather than exposed as variables, so no caller of
# make/build-pdf.sh can override them.
( cd "$RENDERED_DIR" && pandoc "${FILES[@]}" \
    --from=gfm+smart+tex_math_dollars+raw_attribute \
    --pdf-engine=xelatex \
    -V title-meta="Harness Engineering - A Practical Guide" \
    -V author-meta="Javier Sandino" \
    -V geometry:"a4paper,top=2.5cm,bottom=2.5cm,left=3cm,right=3cm" \
    -V mainfont="Georgia" \
    -V sansfont="Helvetica Neue" \
    -V monofont="Menlo" \
    -V colorlinks=true \
    --resource-path=. \
    -o "$FINAL_PDF" )
if [[ ! -f "$FINAL_PDF" ]]; then
  echo "ERROR: pandoc did not produce $FINAL_PDF" >&2
  exit 1
fi

# Publish to public/ so the site serves it. This file is committed.
cp "$FINAL_PDF" "$PUBLISHED_PDF"

echo ""
echo "Done -> $FINAL_PDF"
echo "       $PUBLISHED_PDF"
