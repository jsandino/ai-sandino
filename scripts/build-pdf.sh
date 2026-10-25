#!/usr/bin/env bash
#
# build-pdf.sh — the PDF pipeline, behind `make pdf [GUIDE=<guide>]`.
#
# Usage: build-pdf.sh [<guide>]
#
# Builds public/<guide>.pdf for the named guide, or for every guide when no
# name is given. A guide is a folder in src/content/ with a metadata.yml
# (docs/guide-format.md). For each guide:
#
#   1. scripts/render-diagrams.sh pre-renders its Mermaid diagrams into
#      build/<guide>/rendered/.
#   2. pandoc fills scripts/pdf/cover.tex from metadata.yml.
#   3. One pandoc + xelatex pass converts cover + chapters to
#      build/<guide>/<guide>.pdf, with a page break before every chapter
#      and the contents after the first. One pass means hyperref resolves
#      every intra-document link; there is no PDF merge step to strip the
#      destination table.
#   4. The PDF is copied to public/<guide>.pdf, which is committed.
#
# Requires: xelatex, pandoc, node, mmdc. This script never installs
# anything; it only reports what is missing.

set -euo pipefail

# --- Locations -----------------------------------------------------------
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PDF_DIR="$ROOT_DIR/scripts/pdf"
# shellcheck source=pdf/guides.sh
source "$PDF_DIR/guides.sh"

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

if ! command -v node >/dev/null 2>&1; then
  cat >&2 <<'EOF'
ERROR: node not found on PATH (pandoc runs the contents filter with it).
  Install Node:     see docs/prerequisites.md
EOF
  missing=1
fi

if [[ "$missing" -ne 0 ]]; then
  echo "" >&2
  echo "Install the tool(s) above and re-run 'make pdf'." >&2
  exit 1
fi

# --- Which guides ------------------------------------------------------
ALL_GUIDES=()
while IFS= read -r g; do ALL_GUIDES+=("$g"); done < <(pdf_guides)

if [[ $# -gt 0 && -n "$1" ]]; then
  if [[ ! -f "$CONTENT_DIR/$1/metadata.yml" ]]; then
    guide_error "PDF BUILD: UNKNOWN GUIDE" \
      "GUIDE names a folder in src/content/ that has a metadata.yml." \
      "GUIDE=$1, but src/content/$1/metadata.yml does not exist. Guides: ${ALL_GUIDES[*]:-(none)}" \
      "make pdf GUIDE=<one of the guides above>, or 'make pdf' for all. A new guide needs src/content/<guide>/metadata.yml (docs/guide-format.md)."
    exit 1
  fi
  GUIDES=("$1")
else
  GUIDES=("${ALL_GUIDES[@]}")
fi

if [[ ${#GUIDES[@]} -eq 0 ]]; then
  guide_error "PDF BUILD: NO GUIDES" \
    "a guide is a folder in src/content/ with a metadata.yml." \
    "no src/content/*/metadata.yml." \
    "add metadata.yml to the guide's folder (docs/guide-format.md)."
  exit 1
fi

# --- Helpers -------------------------------------------------------------
MONTHS=(January February March April May June July August September October November December)

# YYYY-MM-DD -> "September 7, 2026"
long_date() {
  local y m d
  IFS=- read -r y m d <<<"$1"
  echo "${MONTHS[$((10#$m - 1))]} $((10#$d)), $y"
}

# Reads metadata.yml through pandoc (no YAML parser) into META_<field>.
read_metadata() {
  local key value
  META_title="" META_subtitle="" META_author="" META_coauthor="" META_date=""
  while IFS='=' read -r key value; do
    printf -v "META_$key" '%s' "$value"
  done < <(pandoc --metadata-file="$CONTENT_DIR/$1/metadata.yml" \
    --template="$PDF_DIR/fields.txt" --from=markdown --to=plain --wrap=none /dev/null)
}

# Checks a guide before anything is built; exits with a remediation-grade
# message on the first problem.
validate_guide() {
  local g="$1" field
  read_metadata "$g"
  for field in title author; do
    local value="META_$field"
    if [[ -z "${!value}" ]]; then
      guide_error "PDF BUILD: MISSING $field" \
        "every guide's metadata.yml sets title and author." \
        "src/content/$g/metadata.yml has no '$field'." \
        "add '$field: <value>' to src/content/$g/metadata.yml (docs/guide-format.md)."
      exit 1
    fi
  done
  if [[ -n "$META_date" && ! "$META_date" =~ ^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$ ]]; then
    guide_error "PDF BUILD: BAD date" \
      "metadata.yml's optional date is written YYYY-MM-DD." \
      "src/content/$g/metadata.yml has date: $META_date" \
      "write it as e.g. 'date: 2026-09-07', or delete it to use the date of the guide's last change."
    exit 1
  fi
  if [[ -z "$(guide_chapters "$g")" ]]; then
    guide_error "PDF BUILD: NO CHAPTERS" \
      "a guide's chapters are its [0-9][0-9]-*.md files, in name order." \
      "no such files in src/content/$g/." \
      "name the chapters 00-intro.md, 01-..., (docs/guide-format.md)."
    exit 1
  fi
}

# Sets DATE (YYYY-MM-DD) and DATE_WHY for a guide: metadata.yml's date if
# set; else today if the folder has staged or uncommitted changes; else the
# date of the last commit that touched it.
resolve_date() {
  local g="$1" rel="src/content/$1"
  if [[ -n "$META_date" ]]; then
    DATE="$META_date" DATE_WHY="the date in $rel/metadata.yml"
  elif [[ -n "$(git -C "$ROOT_DIR" status --porcelain -- "$rel")" ]]; then
    DATE="$(date +%F)" DATE_WHY="today: $rel/ has staged or uncommitted changes"
  else
    DATE="$(git -C "$ROOT_DIR" log -1 --format=%cs -- "$rel")"
    DATE_WHY="the last commit that touched $rel/ ($(git -C "$ROOT_DIR" log -1 --format=%h -- "$rel"))"
  fi
}

build_guide() {
  local g="$1"
  local build_dir="$ROOT_DIR/build/$g"
  local rendered="$build_dir/rendered"
  local final_pdf="$build_dir/$g.pdf"
  local published="$ROOT_DIR/public/$g.pdf"

  echo "== $g"
  read_metadata "$g"
  bash "$ROOT_DIR/scripts/render-diagrams.sh" "$g"

  resolve_date "$g"
  local modified
  modified="$(long_date "$DATE")"
  echo "Date: $modified ($DATE_WHY)"

  # Cover: the shared template, filled from metadata.yml.
  pandoc --metadata-file="$CONTENT_DIR/$g/metadata.yml" -M modified="$modified" \
    --template="$PDF_DIR/cover.tex" --from=markdown --to=latex /dev/null \
    -o "$build_dir/cover.tex"

  # Page breaks and the contents, as raw LaTeX blocks between chapters.
  printf '```{=latex}\n    \\newpage\n```\n' >"$rendered/_pagebreak.md"
  printf '```{=latex}\n\\tableofcontents\n```\n' >"$rendered/_contents.md"

  local chapters=() files=() name
  while IFS= read -r name; do chapters+=("$name"); done < <(guide_chapters "$g")
  files=("${chapters[0]}" _pagebreak.md _contents.md)
  for name in "${chapters[@]:1}"; do files+=(_pagebreak.md "$name"); done

  local title_meta="$META_title"
  [[ -n "$META_subtitle" ]] && title_meta="$META_title - $META_subtitle"

  echo "Converting Markdown -> ${final_pdf#"$ROOT_DIR"/}"

  # Run from the rendered dir so the ./<name>-N.pdf diagram paths resolve.
  #   +smart            : straighten quotes/dashes into typographic forms
  #                       (a raw " in LaTeX renders as a closing quote)
  #   +tex_math_dollars : render the $\rightarrow$ / $\leftarrow$ that
  #                       render-diagrams.sh substituted for glyphs the
  #                       body fonts lack (source has no literal $)
  #   +raw_attribute    : honour the ```{=latex} page-break and contents
  #                       blocks (gfm disables this extension by default)
  #
  # metadata.yml is not passed here: its title/author would trigger the
  # template's \maketitle and print a second title block under the cover.
  # title-meta/author-meta set only the PDF's /Title and /Author (via
  # hyperref's pdftitle/pdfauthor).
  (cd "$rendered" && pandoc "${files[@]}" \
    --from=gfm+smart+tex_math_dollars+raw_attribute \
    --pdf-engine=xelatex \
    --filter="$PDF_DIR/contents-filter.mjs" \
    --include-before-body="$build_dir/cover.tex" \
    -V title-meta="$title_meta" \
    -V author-meta="$META_author" \
    -V geometry:"a4paper,top=2.5cm,bottom=2.5cm,left=3cm,right=3cm" \
    -V mainfont="Georgia" \
    -V sansfont="Helvetica Neue" \
    -V monofont="Menlo" \
    -V colorlinks=true \
    --resource-path=. \
    -o "$final_pdf")
  if [[ ! -f "$final_pdf" ]]; then
    echo "ERROR: pandoc did not produce $final_pdf" >&2
    exit 1
  fi

  # Publish to public/ so the site serves it. This file is committed.
  cp "$final_pdf" "$published"
  echo "Done -> ${published#"$ROOT_DIR"/}"
}

# --- Build ---------------------------------------------------------------
for g in "${GUIDES[@]}"; do validate_guide "$g"; done
for g in "${GUIDES[@]}"; do build_guide "$g"; done
