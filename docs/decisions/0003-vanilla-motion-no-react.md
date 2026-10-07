# 0003 — Use vanilla Motion, no React

**Status:** Accepted
**Date:** 2026-10-06

---

## Context

Motion (formerly Framer Motion) is the chosen animation library. It ships as
a vanilla API (`animate`, `inView`, `scroll`) and as React components
(`motion/react`). The site's principles are "fast" and "JavaScript only where
interaction requires it". The planned animations are mostly scroll-triggered
entrances. The landing graph uses D3, which is vanilla JS.

## Decision

Use the **vanilla `motion` API** in small client-side scripts inside Astro
components. Don't add React.

## Alternatives considered

- **React islands with `motion/react`:** declarative variants, presence and
  layout animations, but it adds `@astrojs/react` and React's runtime
  (~45 KB compressed) on every animated page, for effects the vanilla API
  already covers.

## Consequences

- **Positive:** a few KB per animated page; one way of writing client code
  (vanilla JS) across Motion and D3.
- **Negative:** complex, stateful UI has to be hand-rolled.
- **Neutral:** a future page that needs rich stateful interaction (for
  example, the transformer deep dive) can add React for that page only, in a
  new ADR that supersedes this one.
