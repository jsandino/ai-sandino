# Brief — Shared shell

- **Status:** Done
- **Roadmap:** [phase 002](../roadmap/phase-002.md), steps 4–5
- **Source:** `design-system.md` (tokens, type, components, motion, brand
  marks); `architecture.md` (routes, `topics.ts`, live ⇔ page check);
  ADR 0003 (vanilla Motion), ADR 0008, ADR 0009

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
   - `<head>`: see *Metadata conventions*, plus `lang="en"`.
   - Header and footer (see *Decided* below); sticky header with the
     progressive blur from the design system.
   - A `<main>` slot for page content.
4. **Topic data:** `src/data/topics.ts` with all five topics, typed as in
   `architecture.md`. All `coming-soon` until a topic's page lands.
5. **Live ⇔ page check:** fails if a `live` topic has no page or a
   `coming-soon` topic has one, with a remediation-grade message. Built as
   a Vitest unit test in `tests/unit/`, so `make test-unit` runs it in
   pre-commit and CI without editing gate files.
6. **404 page:** on-brand, links home; text and illustration in *Decided* #5.
7. **Placeholder home replaced:** `src/pages/index.astro` uses the shell
   (hero title only) until the landing brief is built.

The brand assets already exist in `public/` (`favicon.svg`,
`apple-touch-icon.png`, `og.png`; see *Brand marks* in `design-system.md`).
The shell links them; it does not redraw them.

## Metadata conventions

- Title: `<Page title> — ai.sandino.ca`; the home page uses
  `Practical AI engineering — ai.sandino.ca`.
- `site: "https://ai.sandino.ca"` in `astro.config.mjs`, so canonical and
  Open Graph URLs are absolute.
- Every page: meta description (required prop), canonical URL, `og:title`,
  `og:description`, `og:url`, `og:type`, `og:site_name`, `og:image`,
  `og:image:width`, `og:image:height`, `og:image:alt` and
  `twitter:card=summary_large_image`.
- `og:image` defaults to `/og.png` (1200×630, alt "Practical AI
  engineering — ai.sandino.ca"); `Base.astro` takes an optional `image`
  prop so a page can override it.
- Icons: `favicon.svg` (`type="image/svg+xml"`) and `apple-touch-icon.png`.

## Acceptance criteria

1. [ ] Colour tokens are defined once in `global.css`; no colour literals
       anywhere else in `src/` → check: `make test-unit`
2. [ ] The page background matches `bg` under both colour schemes →
       check: `make test-e2e`
3. [ ] Both themes match `design-system.md` visually, including the header
       blur and the pixel field → human review (Cloudflare preview)
4. [ ] No third-party requests on any page (fonts included); no React
       (ADR 0003) → check: `make test-e2e` (no off-origin requests) and
       `make test-unit` (no React in `package.json`)
5. [ ] Every page has a title following the convention, a description,
       and the canonical, Open Graph and Twitter tags above, with absolute
       URLs → check: `make test-e2e`
6. [ ] The favicon and apple-touch-icon are linked and served → check:
       `make test-e2e`
7. [ ] Header: the wordmark links home; the GitHub link has an accessible
       name and points to this repo → check: `make test-e2e`
8. [ ] Footer: author name, repo link, and a pixel field that is
       `aria-hidden` → check: `make test-e2e`
9. [ ] Under reduced motion nothing animates (no running animations on the
       header or the pixel field) → check: `make test-e2e`
10. [ ] `topics.ts` lists all five topics; the live ⇔ page test passes and
        is shown to fail correctly in both directions → check:
        `make test-unit` (fixtures for both failures)
11. [ ] The 404 page builds, shows the text and illustration from *Decided*
        #5, and links home → check: `make test-e2e`
12. [ ] CI passes: format, lint, types, unit, build, link check,
        Lighthouse, e2e (axe included) → check: CI

## Decided

1. **Header contents.** Decided: the wordmark (see *Brand marks*), linking
   home, and a GitHub icon link to this repo with the accessible name
   "Source on GitHub". The graph is the main navigation, so the header
   stays minimal.
2. **Footer contents.** Decided: author name (plain text), a link to this
   repo, and the pixel field (`aria-hidden`; static under reduced motion).
3. **Social preview image.** Decided: one generic site card,
   `public/og.png`, built to the design system's *Brand marks* spec and
   committed before the shell run. Per-topic cards wait until topic pages
   exist ([research 0007](../../research/0007-social-preview-image.md)).
4. **Topic blurbs.** Decided: placeholder OK. The shell doesn't display
   them, so each `blurb` in `topics.ts` is `Placeholder blurb: <title>.`
   The real copy is written in the landing brief, where blurbs first appear.
5. **User-facing text.** Decided: exactly this wording.

   | Where | Text |
   |---|---|
   | Home meta description | Practical AI engineering, explained through interactive pages, companion PDF guides and working code. |
   | 404 heading | Page not found |
   | 404 line | This page escaped the harness. We're writing a check so it never happens again. |
   | 404 link (to `/`) | Back to the home page |
   | 404 title | Page not found — ai.sandino.ca |
   | 404 meta description | This page doesn't exist on ai.sandino.ca. |
   | Footer author | Javier Sandino |
   | Footer repo link | Source on GitHub |

   The 404 page shows `public/404-escaped-node.svg` above the heading, as
   an `<img>` with `alt=""` (decorative). It is committed already; the run
   places it and does not redraw it.

## Out of scope

The landing graph and topic page content (their own briefs), analytics,
a theme toggle (decided: follow the system), per-topic social cards.
