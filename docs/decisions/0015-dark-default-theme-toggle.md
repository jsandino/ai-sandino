# 0015 — Default to dark, with a remembered theme toggle

- **Status:** Accepted
- **Date:** 2026-10-22
- **Supersedes:** 0009-visual-language (theme clause only)

---

## Context

ADR 0009 made the light theme follow the visitor's system setting, with no
toggle. The design is dark-first, and Javier wants every visitor to see it
that way first, while still letting anyone who prefers light switch to it.

## Decision

The site opens in dark for every new visitor, ignoring
`prefers-color-scheme`. An icon-only button in the header (sun while dark,
moon while light, with an `aria-label` naming the action) switches theme.
The choice is stored in `localStorage` and applied by an inline script in
`<head>` before first paint, via a `data-theme` attribute on `<html>`. The
favicon follows the site's theme too: the same script and toggle swap its
link between a dark and a light icon.

## Alternatives considered

- **Follow the system, toggle overrides:** keeps 0009's behaviour, but
  light-mode systems would never see the dark-first design by default.
- **Toggle not remembered:** no storage, but visitors who prefer light
  would have to switch on every page.

## Consequences

- **Positive:** everyone sees the intended dark-first design; light is one
  click away and sticks.
- **Negative:** a small inline script is now required on every page, and
  the theme no longer adapts to the system on its own. Safari may keep
  showing a cached favicon until reload.
- **Neutral:** e2e tests select a theme with `data-theme` / `localStorage`
  instead of `emulateMedia({ colorScheme })`.
