# 0002 — Internal link and anchor checking in CI

**Date:** 2026-10-08
**Status:** Current
**Question:** Which npm-installable tool should check internal links and
`#anchor` fragments in the built site (`dist/`) and in the repo's Markdown,
offline and without flaky external links?

---

**Bottom line:** No single npm-installable tool does both well: use `@untitaker/hyperlink` for `dist/` and `remark-validate-links` (via `remark-cli`) for Markdown. Both are pinned npm devDependencies, run offline on files, and never touch external links.

**Recommendation:**
- **Built site:** `hyperlink dist/ --check-anchors`. It checks internal links and `#id` targets only, skips external URLs by design, and exits non-zero on breakage (exit 2 for anchor-only problems). Optionally `--sources src/` maps errors back to source files.
- **Markdown:** `remark <paths> --use remark-validate-links --frail --quiet`, with `repository: false` (or the GitHub URL) in `.remarkrc.mjs`. It checks file existence, same-file `#heading` and cross-file `file.md#heading` with GitHub-style slugs, fully offline.
- Not lychee: it handles both, but it's a Rust binary with no npm install route (the `lychee` npm package is unrelated), which breaks "same pinned version locally and in CI".

**Key findings:**
- hyperlink: npm `@untitaker/hyperlink` wraps a fast Rust binary; HTML only; `--check-anchors` opt-in; v0.3.2 (0.x, so pin exactly). (source: https://github.com/untitaker/hyperlink, confidence: medium-high)
- remark-validate-links v13.1.0, Node ≥16; the CLI (not the API) validates headings across files. (source: https://github.com/remarkjs/remark-validate-links, confidence: high)
- lychee v0.24.2: Markdown + HTML, `--include-fragments`, `--offline`; binary only; docs warn that nested HTML fragments may not be fully supported. (source: https://lychee.cli.rs/recipes/anchors/, confidence: high)
- linkinator 8.x: npm, `--markdown`, `--check-fragments` (served HTML only, not Markdown headings); starts a local server, so it's heavier. (source: https://github.com/JustinBeckwith/linkinator, confidence: medium)
- markdown-link-check: mainly an HTTP checker; no evidence of cross-file anchor validation. (source: https://github.com/tcort/markdown-link-check, confidence: medium-low)

**Caveats:** The researcher didn't run any of the tools. Astro (rehype) and remark slugs normally match but weren't verified. hyperlink resolves `/foo` against the `dist/` root, so check this if Astro `base` or `trailingSlash` change.
