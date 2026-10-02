#!/usr/bin/env bash
#
# precommit-build-pdf.sh — keep public/harness-guide.pdf in step with its
# Markdown source. Run by Lefthook on pre-commit (see lefthook.yml).
#
#   no guide source staged                       -> nothing to do
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

SRC_REL="src/content/harness-guide"
PDF_REL="public/harness-guide.pdf"

staged_sources=()
while IFS= read -r f; do
  staged_sources+=("$f")
done < <(git diff --cached --name-only -- "$SRC_REL")

if [[ ${#staged_sources[@]} -eq 0 ]]; then
  exit 0
fi

if git diff --cached --name-only -- "$PDF_REL" | grep -q .; then
  stale_source=""
  for f in "${staged_sources[@]}"; do
    # Deleted files have no mtime; the PDF can't be "older" than them.
    if [[ -f "$f" && "$f" -nt "$PDF_REL" ]]; then
      stale_source="$f"
      break
    fi
  done
  if [[ -z "$stale_source" ]]; then
    echo "PDF already staged and current: skipping rebuild."
    exit 0
  fi
  echo "PDF staged but older than $stale_source: rebuilding PDF (~10s)..."
else
  echo "Guide source changed: rebuilding PDF (~10s)..."
fi

if ! make pdf >"$ROOT_DIR/build-pdf.log" 2>&1; then
  # render-diagrams.sh logs "  mermaid  <file>" / "  copy  <file>" before
  # each file, so the last such line names the file being processed.
  last_file="$(grep -E '^  (mermaid|copy) ' "$ROOT_DIR/build-pdf.log" | tail -1 | awk '{print $2}')"
  if grep -q '^Converting Markdown' "$ROOT_DIR/build-pdf.log"; then
    stage="pandoc/xelatex conversion (scripts/build-pdf.sh)"
  else
    stage="Mermaid rendering of $SRC_REL/${last_file:-?} (scripts/render-diagrams.sh)"
  fi
  cat >&2 <<EOF

PDF BUILD FAILED
  Rule: public/harness-guide.pdf must be rebuilt whenever the guide source
        in $SRC_REL/ changes, so the downloadable guide never lags the
        Markdown it is built from.
  Where: $stage
  Found: 'make pdf' exited with an error (stack frames omitted):

$(grep -vE '^[[:space:]]+at ' "$ROOT_DIR/build-pdf.log" | tail -8 | sed 's/^/        /')

  Fix:  Correct the error above (usually a Markdown or Mermaid syntax
        problem in a staged chapter, or a missing tool), then commit again.
        Full log: build-pdf.log. Required tools: docs/prerequisites.md.
        For a deliberate work-in-progress checkpoint of a chapter that does
        not build yet: git commit --no-verify (CI will flag the stale PDF).
EOF
  exit 1
fi

rm -f "$ROOT_DIR/build-pdf.log"
git add "$PDF_REL"
echo "PDF rebuilt and staged: $PDF_REL"
