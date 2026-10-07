# 0009 — Base the visual language on the AI Dev reference

**Status:** Accepted
**Date:** 2026-10-07

---

## Context

The site needed one shared visual language: colours, fonts, components and
motion. The first proposal (zinc neutrals, an amber accent, Geist Sans) was
accepted, then reopened when Javier pointed to
[ai-dev.deeplearning.ai](https://ai-dev.deeplearning.ai/) as the look to
emulate. Its CSS and animation settings were extracted directly and turned
into a mood board (`docs/design/style-sample.html`).

## Decision

Adopt the reference's language: blue-tinted dark neutrals, an emerald
accent, Inter for headings and body, uppercase Geist Mono for labels,
spec-sheet bordered cards, a faint background grid, and spring-based
entrance animations. Adapt it in three ways: add a light theme that follows
the system setting, with **amber** as the light-mode accent; a "Practical AI
engineering" hero title instead of the site name; and a line-art node graph
as the hero motif. The full specification is in `docs/design-system.md`.

## Alternatives considered

- **The first proposal (zinc, amber, Geist Sans):** clean but generic next to
  the reference; superseded before being implemented.
- **Dark only, as the reference is:** simpler, but the original decision was
  to follow the visitor's system setting.

## Consequences

- **Positive:** a distinctive, cohesive look with a proven set of motion
  timings.
- **Negative:** the accent changes between themes, so there's no single
  brand colour; light mode needs three amber shades to stay readable.
- **Neutral:** the mood board is frozen; `design-system.md` is the source of
  truth.
