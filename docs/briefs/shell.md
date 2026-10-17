# Brief — Shared shell

- **Status:** Draft
- **Roadmap:** [phase 002](../roadmap/phase-002.md), steps 4–5
- **Source:** `design-system.md` (tokens, type, components, motion);
  `architecture.md` (routes, `topics.ts`, live ⇔ page check); ADR 0003
  (vanilla Motion), ADR 0008, ADR 0009

## Purpose

The one frame every page shares: theme, fonts, header, footer, metadata,
and the topic data. Pages (landing, topics) are built inside it and never
re-create any of it.

## Required pieces (in build order)

1. **Design tokens:** every colour token from `design-system.md`, for both
   themes, defined once in `src/styles/global.css` as Tailwind 4 theme
   variables, switching with `prefers-color-scheme`. No hard-coded colours
   anywhere else.
2. **Fonts:** Inter and Geist Mono, self-hosted via `@fontsource-variable`
   (added with `make install`). No third-party font requests.
3. **Base layout** (`src/layouts/Base.astro`), used by every page:
   - `<head>`: title, meta description (required per page), canonical URL,
     basic Open Graph tags, favicon, `lang="en"`.
   - Header and footer (contents: see Open questions); sticky header with
     the progressive blur from the design system.
   - A `<main>` slot for page content.
4. **Topic data:** `src/data/topics.ts` with all five topics, typed as in
   `architecture.md`. All `coming-soon` until a topic's page lands.
5. **Live ⇔ page check:** fails if a `live` topic has no page or a
   `coming-soon` topic has one, with a remediation-grade message. Proposed:
   an L3 check (`tools/`) run by a `make` target in pre-commit and CI.
6. **404 page:** on-brand, links home.
7. **Placeholder home replaced:** `src/pages/index.astro` uses the shell
   (hero title only) until the landing brief is built.

## Metadata conventions

- Title: `<Page title> — ai.sandino.ca`; the home page uses
  `Practical AI engineering — ai.sandino.ca`.
- `site: "https://ai.sandino.ca"` in `astro.config.mjs`, so canonical and
  Open Graph URLs are absolute.

## Acceptance criteria

- [ ] Both themes match `design-system.md`'s tokens (checked by switching
      the system theme).
- [ ] No third-party requests for fonts; no React (ADR 0003).
- [ ] Every page uses `Base.astro`; each sets a title and description.
- [ ] `topics.ts` lists all five topics; the live ⇔ page check passes, and
      is shown to fail correctly in both directions.
- [ ] The 404 page builds and links home.
- [ ] Reduced motion is respected by the header and any shell animation.
- [ ] CI passes (Lighthouse gates, link check, format, lint, types).

## Open questions (settle before building the header and footer)

1. **Header contents:** site name (links home) plus what? Recommendation:
   just a GitHub link to this repo. The graph is the main navigation, so
   the header stays minimal.
2. **Footer contents:** recommendation: author name, a link to this repo,
   and the pixel field from the design system.
3. **Social preview image:** a generic site image now, or none until topic
   pages exist? Recommendation: none for now.

## Out of scope

The landing graph and topic page content (their own briefs), analytics,
a theme toggle (decided: follow the system).
