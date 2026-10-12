# 0011 — Pin TypeScript to 6.x while `astro check` needs it

**Status:** Accepted
**Date:** 2026-10-11

---

## Context

The type layer (L2 in [`development.md`](../development.md#enforcement-layers))
runs `astro check`, which needs `@astrojs/check` and `typescript` installed
as dev dependencies. `@astrojs/check` supports TypeScript 5 and 6 only.

npm's `latest` tag for `typescript` is now 7.x, the native port. Upstream has
marked TypeScript 7 support in `@astrojs/check` as "unable to fix" for now
(withastro/astro#17268). An install without a version range, or a routine
upgrade, pulls in 7 and breaks the type check.

## Decision

Declare `typescript` as `^6` in `devDependencies`. Keep it there until
`@astrojs/check` supports TypeScript 7, and record that move in a new ADR
that supersedes this one.

## Alternatives considered

- **TypeScript 7 without `astro check`:** this drops the type layer
  entirely, so `.astro` files would go unchecked.
- **TypeScript 7 for the editor, 6 for `astro check`:** two compilers to
  keep in sync and explain, which is too much for a one-person site.
- **Exact pin (`6.x.y`):** this blocks harmless patch and minor updates for
  no benefit; `^6` already keeps 7 out.

## Consequences

- **Positive:** installs are reproducible, and `astro check` keeps working
  locally and in CI.
- **Negative:** someone has to watch the upstream issue. Any future
  dependency bot needs a rule that keeps `typescript` below 7.
- **Neutral:** the editor's TypeScript language features stay on 6.x.

## References

- [Research 0004](../../research/0004-lint-format-typecheck.md)
- withastro/astro#17268
