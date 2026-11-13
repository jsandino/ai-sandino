# 0019 — Set every guide's PDF in bundled, readable type

- **Status:** Accepted
- **Date:** 2026-11-12

---

## Context

The PDFs were set in the system fonts Georgia, Helvetica Neue and Menlo, at
pandoc's default 10pt with single line spacing and 3 cm side margins.
They were tedious to read: cramped, in a face that is not easy on the eye.
The book faces that read well, such as Minion Pro and Myriad Pro, are
commercial Adobe fonts, not installed on this machine and not
redistributable.

A build that relies on system fonts also differs between machines, and CI
may not have them at all.

## Decision

Every guide's PDF uses free, open-licensed fonts committed in
`scripts/pdf/fonts/`, with their licenses beside them: Source Serif 4 for
the body, Source Sans 3 for sans text, Ubuntu Mono for code, and Outfit
Medium for the cover title, a geometric sans. The cover title is black.

The body is 10pt with line spacing 1.1 and 2.4 cm side margins (2.2 cm top
and bottom). Part titles (`#`) are 24pt. Numbered chapter headings (`## 1.`,
`## A.1`) are 14pt and unnumbered ones 12pt. LaTeX's article class offers
only 10, 11 and 12pt, so 10.5pt would need a custom size override.

The headings are set by `scripts/pdf/style-header.tex` and
`scripts/pdf/heading-sizes.mjs`; the fonts and page geometry stay set once,
in `build-pdf.sh`, shared by every guide.

## Alternatives considered

- **Crimson Pro for the body:** the closest free match to Minion Pro in
  style, but its strokes are lighter and it read less well than Source
  Serif 4 in a side-by-side comparison.
- **Minion Pro and Myriad Pro themselves:** an exact match, but commercial,
  not available here and not committable.
- **11pt body, line spacing 1.0, or 11pt with 1.2:** easier still to read,
  but 58 to 70 pages against 54 for the old layout; 10pt with 1.1 keeps the
  length close while opening up the lines.
- **Download the fonts at build time:** keeps the repo smaller, but makes
  the build depend on the network and on third-party URLs.
- **Keep the system fonts:** nothing to maintain, but the readability
  problem stays and the build differs by machine.

## Consequences

- **Positive:** the PDFs are easier to read and build the same on any
  machine, including CI, with no system fonts needed.
- **Negative:** about 2.8 MB of font files in the repo, and their licenses
  to keep with them. Source Serif 4 is a lookalike of Minion Pro, not
  the same typeface.
- **Neutral:** the 10pt body is smaller than the 11pt that reads easiest;
  the extra line spacing and the bigger headings carry the readability
  gain, and the guide stays about as long as before.

## References

- Source Serif 4, Source Sans 3 (SIL OFL 1.1, Adobe); Outfit (SIL OFL 1.1);
  Ubuntu Mono (Ubuntu Font Licence 1.0).
- [ADR 0016](0016-guide-format-and-generic-pdf-pipeline.md): the generic
  PDF pipeline this builds on.
