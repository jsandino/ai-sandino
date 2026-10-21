# 0014 — Build pages as files, with no trailing slash

- **Status:** Accepted
- **Date:** 2026-10-20

---

## Context

Routes are documented without a trailing slash (`/harness-engineering`,
`docs/architecture.md`), and links and `topics.ts` follow that form. Astro's
default `build.format: 'directory'` writes each page as `<slug>/index.html`,
which Cloudflare Pages serves at `/<slug>/` (redirecting `/<slug>` there),
and gives `Astro.url` a trailing slash.

The first symptom appeared with the shell: the 404 page's canonical and
`og:url` came out as `/404/`. Astro always builds the 404 as `404.html`, so
Cloudflare serves it at `/404` and redirects `/404/` (308): the canonical
pointed at a redirect. A probe of the live site confirmed it, and
`tests/e2e/urls.spec.ts` reproduced it against the build. Every topic page
would hit the same mismatch the moment it went live.

## Decision

Set `build.format: 'file'` and `trailingSlash: 'never'` in
`astro.config.mjs`. Pages are built as `<slug>.html` (and `index.html`,
`404.html`), which Cloudflare Pages serves at `/<slug>` with no redirect.
Every page URL (canonical, `og:url`, internal links) is slash-less, except
`/`. `tests/e2e/urls.spec.ts` enforces the form on every built page.

## Alternatives considered

- **Strip the slash from the canonical in `Base.astro`:** fixes the 404, but
  topic pages would still be served at `/<slug>/`, so their slash-less
  canonicals would point at redirects.
- **`directory` with `trailingSlash: 'always'`:** consistent for normal
  pages, but the 404 stays a file served at `/404`, so its canonical
  (`/404/`) would still redirect; and routes, links, docs and tests would
  all need slashes.

## Consequences

- **Positive:** the build and Cloudflare agree by construction: one URL
  form, no redirects, documented routes unchanged.
- **Negative:** the local `astro preview` doesn't reproduce Cloudflare's
  redirects, so tests check the *form* of URLs rather than how a server
  answers them.
- **Neutral:** Astro's official pairings are `never` + `file` and
  `always` + `directory`; this is the first.
