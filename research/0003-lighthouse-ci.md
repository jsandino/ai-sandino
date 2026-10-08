# 0003 — Lighthouse CI for the static build, without public upload

**Date:** 2026-10-08
**Status:** Current
**Question:** How should Lighthouse CI (`@lhci/cli`) audit the static Astro
build on every PR, with score assertions, keeping reports private?

---

**Bottom line:** `@lhci/cli` as a devDependency, a `lighthouserc.json` with `staticDistDir: ./dist`, 3 runs, explicit per-category `minScore` assertions (no presets), `upload.target: "filesystem"`, run via `lhci autorun` from a script behind `make lighthouse`.

**Recommendation:**
- `collect`: `staticDistDir: "./dist"`, `numberOfRuns: 3`; lhci serves the directory itself and discovers every `.html` file to `staticDirFileDiscoveryDepth` (default 2).
- `assert`: `"categories:<id>": ["error", {"minScore": N, "aggregationMethod": "median-run"}]` for performance, accessibility, best-practices and seo. The default aggregation is `pessimistic`, so set `median-run` explicitly. Avoid the `lighthouse:recommended` and `no-pwa` presets: they assert on many individual audits and are noisy.
- `upload`: `target: "filesystem"`, `outputDir: "./.lighthouseci"` (gitignored). In CI, upload that directory as an artifact with `if: always()`. Never use `temporary-public-storage`.
- `autorun` runs collect, assert and upload, and exits non-zero on any `error` assertion.

**Key findings:**
- Config discovery and syntax as above. (source: https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/configuration.md, confidence: high)
- `ubuntu-latest` runners ship with Chrome; on macOS lhci uses the installed Google Chrome (`CHROME_PATH` to override). (source: https://github.com/actions/runner-images, confidence: medium-high)
- `--no-sandbox` is often needed in containers or as root; harmless on GitHub VMs and macOS. (confidence: medium)
- Performance is the noisy category: median of 3 runs; if flaky, 5 runs or `warn`. The default simulated throttling is more stable than DevTools throttling. (confidence: medium)
- The default form factor is **mobile** (slow 4G, 4× CPU) and stricter; the `desktop` preset is more forgiving. (confidence: medium)
- Estimated 10–20 s per run for a small static page; runtime grows linearly with page count. (confidence: low, an estimate)

**Caveats:** The current version (0.14 vs 0.15) and Node 22 support weren't verified; check them with `npm view` and one CI run. The runtime is an estimate.
