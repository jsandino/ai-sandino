# 0013 — Test layers: Vitest for units, Playwright with axe end to end

- **Status:** Accepted
- **Date:** 2026-10-18

---

## Context

Stage 1 of ADR 0012 needs each brief's acceptance criteria to map to an
automated check, but the repo has none that exercise the pages. Format,
lint, types, links and Lighthouse (ADR 0010) check the code and score the
build. None of them asserts what a page contains or fails on a specific
accessibility violation. Every command must still run through `make`
(ADR 0005), and the tools were researched in `research/0006`.

## Decision

Add two test layers, each with one smoke test:

- **Unit (`make test-unit`):** Vitest, configured with Astro's
  `getViteConfig`, tests in `tests/unit/`. The smoke test renders
  `src/pages/index.astro` through the Container API and checks its `<h1>`.
  It runs in the Lefthook pre-commit hook when code is staged, and in CI.
- **End to end (`make test-e2e`):** Playwright on Chromium (headless shell
  only), against `astro preview` serving the built `dist/`, tests in
  `tests/e2e/`. The smoke test loads `/` and fails on any axe violation
  tagged `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` or `wcag22aa`. It runs
  in CI only, not in a hook, because it needs a build and a browser.
- **CI:** both run in the existing `site` job, after `make build`, sharing
  `dist/`. The required checks stay `site` and `pdf`. `make browsers`
  installs Chromium with its OS dependencies on every run, with no cache.
  The Playwright HTML report is uploaded as an artifact when the job fails.

## Alternatives considered

- **E2E in a `pre-push` hook:** catches page failures before CI, but adds
  a build and browser run (about 30–60 s) to every push. Revisit after the
  first Stage 1 run.
- **Caching Playwright browsers in CI:** Playwright advises against it;
  restoring takes about as long as downloading, and OS dependencies must be
  installed anyway.
- **All three browser engines:** more coverage, but slower CI and more
  flakiness for a static site with no browser-specific code yet.
- **A placeholder unit test (`1 + 1`):** proves the runner works but
  tests nothing. The site has no TypeScript modules yet, so the page itself
  is the unit.
- **Separate CI jobs for tests:** clearer names, but each would repeat the
  install and the build (the same reasoning as ADR 0010).

## Consequences

- **Positive:** brief criteria about page content and accessibility can
  map to a test, so the agent can verify its own work in a loop. Both
  layers are reproducible locally with the same `make` command.
- **Negative:** the Container API is still `experimental_AstroContainer`
  and may change in a minor Astro release; a break shows up as a failing
  `make test-unit`. Every CI run downloads Chromium (roughly 20–40 s).
- **Neutral:** axe catches only part of WCAG, so it complements
  Lighthouse and human review rather than replacing them. A broken page is
  caught in CI, not at commit time.

## References

- [`research/0006-test-layers.md`](../../research/0006-test-layers.md)
- [ADR 0010](0010-ci-checks-and-gates.md), [ADR 0012](0012-staged-agent-autonomy.md)
