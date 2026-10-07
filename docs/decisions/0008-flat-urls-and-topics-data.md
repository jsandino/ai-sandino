# 0008 — Use flat URLs, with `topics.ts` as the single source

**Status:** Accepted
**Date:** 2026-10-06

---

## Context

The landing graph, topic pages and navigation all need the same facts about
each topic: slug, title, blurb, and whether it's live or coming soon. There
are five topics, and the site has no other kind of content.

## Decision

Topic pages live at flat slugs (`/harness-engineering`, `/rag-in-production`,
…). Topic facts live in one typed file, `src/data/topics.ts`, read by every
consumer. A build-time check enforces that a topic is live if and only if
its page exists.

## Alternatives considered

- **`/topics/<slug>`:** a nesting level with no benefit unless other kinds of
  content (for example, a blog) are added later.
- **An Astro content collection:** more machinery than five records need;
  TypeScript already enforces the shape.

## Consequences

- **Positive:** short, shareable URLs; taking a topic live is a one-line
  change; the graph can't link to a missing page.
- **Negative:** adding a different kind of content later may call for a URL
  scheme decision (a new ADR).
