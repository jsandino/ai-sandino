#!/usr/bin/env bash
#
# precommit-build-pdf.sh — keep each guide's public/<guide>.pdf in step with
# its Markdown source in src/content/<guide>/. Run by Lefthook on pre-commit
# (see lefthook.yml). For each guide:
#
#   no source of that guide staged               -> nothing to do
#   source staged, PDF not staged                -> rebuild + stage PDF
#   source staged, PDF staged, PDF newer than
#     every staged source file                   -> skip (already built)
#   source staged, PDF staged but older than
#     some staged source file                    -> rebuild + stage PDF
#
# Working-tree mtimes are reliable here (local, pre-commit). They are NOT
# reliable after a clone or checkout, which is why CI uses commit history.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
# shellcheck source=pdf/guides.sh
source "$ROOT_DIR/scripts/pdf/guides.sh"

# Rebuilds and stages one guide's PDF if its staged source needs it.
check_guide() {
  local g="$1"
  local src_rel="src/content/$g"
  local pdf_rel="public/$g.pdf"
  local log="build/$g/build-pdf.log"

  local staged_sources=() f
  while IFS= read -r f; do
    staged_sources+=("$f")
  done < <(git diff --cached --name-only -- "$src_rel")

  if [[ ${#staged_sources[@]} -eq 0 ]]; then
    return 0
  fi

  # The content rules come first, so a commit whose staged PDF is already
  # current can't skip them (docs/guide-format.md#content-rules).
  node scripts/pdf/content-check.mjs "$src_rel" || exit 1

  if git diff --cached --name-only -- "$pdf_rel" | grep -q .; then
    local stale_source=""
    for f in "${staged_sources[@]}"; do
      # Deleted files have no mtime; the PDF can't be "older" than them.
      if [[ -f "$f" && "$f" -nt "$pdf_rel" ]]; then
        stale_source="$f"
        break
      fi
    done
    if [[ -z "$stale_source" ]]; then
      echo "$g: PDF already staged and current: skipping rebuild."
      return 0
    fi
    echo "$g: PDF staged but older than $stale_source: rebuilding PDF (~15s)..."
  else
    echo "$g: guide source changed: rebuilding PDF (~15s)..."
  fi

  mkdir -p "build/$g"
  if ! make pdf GUIDE="$g" >"$log" 2>&1; then
    # render-diagrams.sh logs "  mermaid  <file>" / "  copy  <file>" before
    # each file, so the last such line names the file being processed.
    local last_file stage
    last_file="$(grep -E '^  (mermaid|copy) ' "$log" | tail -1 | awk '{print $2}')"
    if grep -q '^Converting Markdown' "$log"; then
      stage="pandoc/xelatex conversion (scripts/build-pdf.sh)"
    elif [[ -n "$last_file" ]]; then
      stage="Mermaid rendering of $src_rel/$last_file (scripts/render-diagrams.sh)"
    else
      stage="guide checks before the build (scripts/build-pdf.sh)"
    fi
    cat >&2 <<EOF

PDF BUILD FAILED: $g
  Rule: $pdf_rel must be rebuilt whenever the guide source in $src_rel/
        changes, so the downloadable guide never lags the Markdown it is
        built from.
  Where: $stage
  Found: 'make pdf GUIDE=$g' exited with an error (stack frames omitted):

$(grep -vE '^[[:space:]]+at ' "$log" | tail -8 | sed 's/^/        /')

  Fix:  Correct the error above (usually a Markdown or Mermaid syntax
        problem in a staged chapter, a metadata.yml problem, or a missing
        tool), then commit again. Full log: $log.
        Required tools: docs/prerequisites.md.
        For a deliberate work-in-progress checkpoint of a chapter that does
        not build yet: git commit --no-verify (CI will flag the stale PDF).
EOF
    exit 1
  fi

  git add "$pdf_rel"
  echo "$g: PDF rebuilt and staged: $pdf_rel"
}

while IFS= read -r g; do
  check_guide "$g"
done < <(pdf_guides)
