#!/usr/bin/env bash
#
# render-diagrams.sh — Step 1 of the PDF pipeline.
#
# Pre-renders Mermaid diagrams: for every guide-body Markdown file, each
# ```mermaid fenced block is replaced with a reference to a rendered PDF
# image. The rewritten Markdown and the image files are written to
# build/rendered/. Source Markdown files are treated as read-only and are
# never modified.
#
# Files without any Mermaid blocks are copied verbatim.
#
# Requires: mmdc (Mermaid CLI).
#   npm install -g @mermaid-js/mermaid-cli

set -euo pipefail

# --- Locations -------------------------------------------------------------
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="$ROOT_DIR/build/rendered"

# --- Guide source location and file order (shared with build-pdf.sh) ---
# shellcheck source=guide-files.sh
source "$ROOT_DIR/scripts/guide-files.sh"
SRC_DIR="$GUIDE_SRC_DIR"
FILES=("${GUIDE_FILES[@]}")

if [[ ! -d "$SRC_DIR" ]]; then
  cat >&2 <<EOF
ERROR: guide source directory not found: $SRC_DIR
  The PDF is built from the guide's Markdown chapters, which live there.
  Copy the chapter files (cover.md, 00-intro.md, ...) into that directory,
  then re-run 'make pdf'. The file order is defined in scripts/guide-files.sh.
EOF
  exit 1
fi

# --- Dependency check ----------------------------------------------------
if ! command -v mmdc >/dev/null 2>&1; then
  cat >&2 <<'EOF'
ERROR: mmdc (Mermaid CLI) not found on PATH.

  Install it globally with npm:

      npm install -g @mermaid-js/mermaid-cli

  Then re-run this build. mmdc bundles a headless Chromium; on first run it
  may download it. If Chromium fails to launch, set PUPPETEER_EXECUTABLE_PATH
  to a local Chrome/Chromium binary.
EOF
  exit 1
fi

# --- Cross-file link map ----------------------------------------------
# The table of contents (and a stray link in the intro) points at sibling
# Markdown files: ./NN-name.md and ./NN-name.md#section. Pandoc turns those
# into "open external file" actions when it concatenates everything into one
# PDF, so every entry is a dead link. Below, the per-file perl pass rewrites
# them to in-document anchors on the build copy:
#   ./NN-name.md#section  ->  #section          (already Pandoc's heading id)
#   ./NN-name.md          ->  #<slug of that file's H1>
# The slug rule mirrors Pandoc's gfm identifiers (GitHub-style): lower-case,
# delete everything but [a-z0-9 -], trim ends, then each remaining space
# becomes a hyphen -- runs are NOT collapsed, so a deleted "-" between words
# leaves a double hyphen: "Part I - Foundations" -> part-i--foundations.
LINK_SUBS=()
for f in "$SRC_DIR"/[0-9][0-9]-*.md; do
  h1="$(sed -n 's/^# //p' "$f" | head -1)"
  [[ -n "$h1" ]] || continue
  slug="$(printf '%s' "$h1" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9 -]//g; s/^ +//; s/ +$//; s/ /-/g')"
  esc="$(basename "$f")"; esc="${esc//./\\.}"
  LINK_SUBS+=("s{\\]\\((?:\\./)?${esc}\\)}{](#${slug})}g;")
done
# Fragment links: strip the "./NN-name.md" prefix, keep the "#section" (no
# backreference, so this survives the double-quoted -e handoff to perl).
FRAG_SUB='s{\]\((?:\./)?[0-9]{2}-[a-z0-9-]+\.md(?=#[a-z0-9-]+\))}{](}g;'

# --- Rebuild output directory from scratch ------------------------------
rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

echo "Rendering diagrams -> $OUT_DIR"

for name in "${FILES[@]}"; do
  src="$SRC_DIR/$name"

  if [[ ! -f "$src" ]]; then
    echo "ERROR: source file not found: $src" >&2
    exit 1
  fi

  if grep -q '^```mermaid' "$src"; then
    echo "  mermaid  $name"
    # Markdown-input mode: rewrites each ```mermaid block to an image
    # reference and writes the images (as cropped PDFs) alongside the
    # output .md, so relative paths resolve when Pandoc runs from $OUT_DIR.
    #   -e pdf : vector images, embedded sharply by XeLaTeX
    #   -f     : crop the PDF to the diagram bounding box
    #   -q     : quiet
    mmdc -i "$src" -o "$OUT_DIR/$name" -e pdf -f -q
  else
    echo "  copy     $name"
    cp "$src" "$OUT_DIR/$name"
  fi

  # Normalize the build/ copy (source files are never touched):
  #  - Unicode glyphs the body fonts (Georgia/Menlo) don't carry in BasicTeX,
  #    so they render instead of dropping out. build-pdf.sh enables Pandoc's
  #    tex_math_dollars so the $...$ forms become real symbols.
  #  - cross-file Markdown links -> in-document anchors (see LINK_SUBS above).
  perl -CSD -i -pe '
    s/\x{26A0}\x{FE0F}?/[!]/g;   # WARNING SIGN (+ optional variation selector)
    s/\x{FE0F}//g;               # stray variation selectors
    s/\x{2192}/\$\\rightarrow\$/g;
    s/\x{2190}/\$\\leftarrow\$/g;
  ' -e "$FRAG_SUB ${LINK_SUBS[*]}" "$OUT_DIR/$name"
done

echo "Done. $(find "$OUT_DIR" -name '*.pdf' | wc -l | tr -d ' ') diagram image(s) rendered."
