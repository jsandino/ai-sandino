#!/usr/bin/env bash
#
# guide-files.sh — shared configuration for the PDF pipeline.
#
# Sourced (not executed) by render-diagrams.sh and build-pdf.sh so both
# scripts agree on where the guide source lives and in what order its files
# are concatenated. Edit the order here, in one place.

# Guide Markdown source (read-only to the pipeline).
GUIDE_SRC_DIR="$ROOT_DIR/src/content/harness-guide"

# Guide body file order.
GUIDE_FILES=(
  "cover.md"
  "00-intro.md"
  "pagebreak.md"
  "01-contents.md"
  "pagebreak.md"
  "02-heuristics.md"
  "pagebreak.md"
  "03-part-1-foundations.md"
  "pagebreak.md"
  "04-part-2-context-architecture.md"
  "pagebreak.md"
  "05-part-3-mechanical-constraints.md"
  "pagebreak.md"
  "06-part-4-agent-capabilities.md"
  "pagebreak.md"
  "07-part-5-feedback-loops.md"
  "pagebreak.md"
  "08-part-6-operating-discipline.md"
  "pagebreak.md"
  "09-appendix-a-toolchain.md"
  "pagebreak.md"
  "10-appendix-b-templates.md"
  "pagebreak.md"
  "11-appendix-c-further-reading.md"
)
