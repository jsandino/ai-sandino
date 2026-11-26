# 0021 — Let a guide opt in to looser contents spacing

- **Status:** Accepted
- **Date:** 2026-11-25

---

## Context

The PDF contents list every part and every numbered section, one line each,
set tightly by LaTeX's article class. The transformers guide has twelve
parts and 42 sections, which is about 62 lines. A page holds about 49, so
the list fills one page and spills a quarter of the next: a short, awkward
second page that starts partway through a part.

The contents' look is set by the article class, shared by every guide. The
harness guide's list fits one page and is fine as it is.

## Decision

A guide may set `contents-spacing: loose` in its `metadata.yml`. The build
then includes `scripts/pdf/contents-loose.tex`, which adds vertical space
before every part entry and before every section entry in the contents, and
keeps a part entry on the same page as the entry after it, so a part
heading is never left alone at the bottom of a page. A guide that leaves
the field out, or sets `normal`, gets the contents as before. Any other
value fails the build with a remediation message.

The transformers guide sets it, so its contents fill two pages and the
second starts at a part.

## Alternatives considered

- **Loosen every guide's contents:** simpler, but it changes the harness
  guide's PDF, which needs no change, and rebuilds and re-commits it.
- **A page break in the contents before a chosen part:** prototyped. It
  balances the two pages, but leaves the first page's lower third empty,
  and needs the heading chosen by hand.
- **Make the contents shorter (list parts only, or merge sections):**
  changes what the contents say for a layout reason.
- **The `tocloft` package:** makes entry spacing a one-line setting, but it
  is not in the bundled TeX distribution, so the entry styles are
  redefined by hand.

## Consequences

- **Positive:** a guide with a long contents can have two well-filled
  pages, and no other guide changes.
- **Negative:** the spacing values were tuned by eye on one guide. Adding
  or removing a section there can move where the pages break, so they may
  need a recheck. The article class's two entry styles are redefined, so a
  change to them in a LaTeX update would need the same care.
- **Neutral:** one more optional field in `metadata.yml`.

## References

- [`docs/guide-format.md`](../guide-format.md#metadatayml)
