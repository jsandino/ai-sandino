# 0006 — Put off rendering Mermaid on the web

**Status:** Accepted
**Date:** 2026-10-02

---

## Context

Mermaid is in the stack and the PDF guides use it heavily
(`scripts/render-diagrams.sh` renders it to PDF images). On the web, rendering
in the browser costs about 1 MB of JavaScript, while rendering at build time
needs new tooling. No planned page needs a Mermaid diagram: the topic 1
visuals are custom Motion and D3 work.

## Decision

Don't add any web Mermaid tooling until a page actually needs a static
diagram. When one does, extend `render-diagrams.sh` to also produce
site-themed SVGs (`mmdc -e svg`) and commit them, as the PDF pipeline does.

## Alternatives considered

- **Render in the browser:** too heavy for a site that's meant to be fast.
- **Set up build-time rendering now:** infrastructure with nothing to use it.

## Consequences

- **Positive:** no unused tooling or JavaScript.
- **Negative:** the first page that wants a Mermaid diagram pays the setup
  cost.
