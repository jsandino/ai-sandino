# 0020 — Draw plots in guides as TikZ files, coloured from the diagram palette

- **Status:** Accepted
- **Date:** 2026-11-05

---

## Context

A guide's diagrams are Mermaid blocks, rendered to vector PDFs by the PDF
pipeline, and coloured by name ([ADR 0016](0016-guide-format-and-generic-pdf-pipeline.md)).
Mermaid draws flowcharts well, but the transformers guide needs a plot: sine
and cosine curves of the positional encoding at two frequencies, with the
length of one cycle marked on each. A Mermaid line chart can't carry the
colour names the pipeline writes into every diagram, can't draw the brackets
and callouts that make the point, and falls back to its own palette.

The other ways to get a plot into a guide each have a cost. An image made
elsewhere (matplotlib, a screenshot) is a binary file with no source in the
repo, and nothing here installs a plotting library. The TeX installation the
PDF pipeline already needs ships TikZ and the `standalone` class, which draw
exactly this kind of figure as vector PDF.

## Decision

A guide may hold TikZ figures in `src/content/<guide>/figures/<name>.tex`,
each a standalone LaTeX document. The pipeline compiles every one with
`xelatex` into `figures/<name>.pdf` beside the rendered chapters, and a
chapter shows it as an ordinary image,
`![description](figures/<name>.pdf)`. Figures take their colours from the
diagram palette (`scripts/pdf/diagram-classes.mmd`) by name: the pipeline
generates a `diagram-colours` package from that file, defining `sky`,
`violet`, `emerald`, `coral`, `amber` and `neutral` (the stroke colour) and
`skyfill` and so on (the fill colour). A figure uses these names and never
writes a colour value, as a Mermaid diagram never styles itself. The pipeline
also generates a `diagram-fonts` package that sets the body font of
`build-pdf.sh`, so a figure never names a font.

## Alternatives considered

- **A Mermaid line chart:** keeps one diagram tool, but needs the colour
  definitions kept out of non-flowchart diagrams and a chart palette set
  somewhere, and still can't draw cycle markers or callouts.
- **Images made outside the repo:** no source to review or regenerate, and a
  binary file per figure that goes stale when the palette or fonts change.
- **A plotting package such as pgfplots:** nicer axes, but it isn't in the
  TeX installation the pipeline depends on, so every contributor would need
  another install.

## Consequences

- **Positive:** a figure is reviewable text, vector in the PDF, and recoloured
  with the palette. Any guide can use the mechanism, and guides without a
  `figures/` folder build exactly as before.
- **Negative:** figures are TeX, a second drawing language beside Mermaid, and
  the body font is named twice, in `build-pdf.sh` and in the generated
  `diagram-fonts` package, so a font change has to be made in both. A figure
  that fails to compile fails the guide's build.
- **Neutral:** raw LaTeX is still not allowed inside chapters
  ([ADR 0016](0016-guide-format-and-generic-pdf-pipeline.md)); a figure
  source is a separate file, and the chapter only references its output.
