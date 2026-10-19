# 0007 — Social preview images (og:image) for the shared shell

- **Date:** 2026-10-18
- **Status:** Current
- **Question:** Should the shared shell ship a social preview (og:image /
  Twitter card) image now, and if so what kind? What does a static image
  cost versus build-time generation in Astro, which tags and sizes do the
  platforms need, and which real examples fit this site's design system?

---

**Bottom line:** Ship one static, hand-made 1200x630 PNG now (about 30 minutes of work, zero new dependencies). A text-only card is a weak first impression for a site meant to be shared. Defer per-topic generation until topic pages exist.

**Recommendation:**

- **Option (a), ship now.** Add `public/og.png` at 1200x630, dark theme, under 300 KB.
  - Layout: a spec-sheet card on the 30px hero grid, using design-system tokens: bg `#13131a`, grid-line, emerald `#10b981`, Inter 700 at -0.035em, Geist Mono uppercase label.
  - Text: "Practical AI **engineering**" with "engineering" in the accent, and a small "ai.sandino.ca" mono label.
  - Dark only. Link previews do not follow `prefers-color-scheme`, and the design is dark-first.
  - Export the PNG from a throwaway HTML page screenshotted at 1200x630, or from Figma. Commit the PNG.
- **Meta tags in `Base.astro`**, with the image URL built via `new URL('/og.png', Astro.site)` (requires `site` in `astro.config`):
  - `og:title`, `og:description`, `og:url`, `og:type`, `og:site_name`
  - `og:image` (absolute URL), `og:image:width=1200`, `og:image:height=630`, `og:image:alt`
  - `twitter:card=summary_large_image`. `twitter:title`, `twitter:description` and `twitter:image` fall back to the og tags, so you can skip them (medium confidence).
  - Let a page override the image through a prop, so per-topic images can slot in later without a layout change.
- **Option (b), later.** For per-topic images, use `astro-og-canvas`. It is a static `OGImageRoute` endpoint, so output is plain PNG files and works on Cloudflare Pages. Its dependency is `canvaskit-wasm`, which pnpm users must install explicitly. Fonts are local TTF/OTF/WOFF paths, and it supports a background image or gradient, logo, border and padding.
  - Its limits matter here. It has no HTML/CSS layout, so reproducing the grid and spec-sheet look means supplying a pre-rendered background image and placing only title and description over it.
  - It is in the 0.x range (npm showed 0.7.0). Check the current version at install time.
  - Alternative: Satori plus Sharp. It gives full flexbox layout, but you write the JSX-like template yourself and add two native-ish dependencies. This is overkill for five topics.
  - Cheapest alternative for five topics: five hand-made PNGs sharing one template.
- **Do this now:** use a distinct filename per image, such as `og.png` today and `og/<slug>.png` later. Facebook caches by URL, so changing an image means changing its URL.

**Key findings:**

1. **Effort.**
   - Option (a) is one file plus about 8 lines in the layout.
   - Option (b) is one endpoint file plus fonts and a background asset, and adds build time per page (no numbers found). For five topics, hand-made is cheaper than the tooling.
2. **Dimensions and limits.**
   - Facebook/Open Graph: at least 1200x630 recommended, 600x315 minimum for a large card, 1.91:1 ratio, 8 MB maximum. Setting `og:image:width` and `og:image:height` lets the crawler render the image on the first share. (source: https://developers.facebook.com/docs/sharing/webmasters/images/, confidence high)
   - LinkedIn: 1200x627 (1.91:1). Use JPEG or PNG, not WebP. It reads og tags, not twitter tags. A shared post's preview does not update. Use Post Inspector to refresh the cache. (source: https://www.joinvalley.co/blog/linkedin-post-inspector-link-preview and search results, confidence medium; the cache TTL is unverified)
   - X: the official docs page returned HTTP 402, so it could not be verified directly. A third-party source says JPG, PNG, WEBP and GIF are accepted, SVG is not, and `og:image` is the fallback (confidence medium). The 5 MB limit is from memory, unverified.
   - Slack reads og tags and ignores twitter tags. Cache lifetimes in sources conflict (30 minutes, 24 hours, 30+ days), so treat them as unknown. Discord caches per URL, and a changed query string forces a refetch. (source: https://nuxtseo.com/learn-seo/nuxt/mastering-meta/slack and https://env.dev/guides/opengraph-image-not-showing, confidence low-medium)
   - Failure causes: relative URLs, SVG, bot-blocking rules or robots.txt, and an image that is not publicly reachable.
   - GitHub repo social preview (separate from the site): PNG, JPG or GIF, under 1 MB, 1280x640 best, 640x320 minimum. (source: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/customizing-your-repositorys-social-media-preview, confidence high)
3. **With no og:image**, no authoritative source describes each platform. Typical behaviour is a text-only link card (title, description, domain) on Slack, Discord and LinkedIn, and a small summary card on X, which looks plain and gets less attention. Treat this as common knowledge, not verified (confidence low).
4. **Real examples verified by viewing the image:**
   - **Tailwind CSS**, https://tailwindcss.com. Image: https://tailwindcss.com/opengraph-image.jpg (1200x630 JPEG, 292 KB). Dark navy background, faint dotted grid and dashed isometric lines, a wireframe 3D "4.3" and a mono spec-sheet box in the corner, wordmark bottom-left. Closest to this site's hero grid and spec-sheet card. It is a release-specific image.
   - **GitHub repo cards**, e.g. https://github.com/withastro/astro. Image: https://opengraph.githubassets.com/1/withastro/astro (1200x600 PNG). White background, large "owner/**repo**" title, a gray description, logo at right, a stats row, and a colour bar for languages. A good model for a per-topic title-plus-meta layout.
5. **Real sites not verified** (WebFetch strips `<head>`; guessed image URLs failed): Astro docs, Vercel, Linear, Josh Comeau, Lee Robinson, Maggie Appleton, Simon Willison. Check with a preview tool.
   - Only one fact on Simon Willison is confirmed: his TIL site generates per-page cards with `shot-scraper` (HTML page screenshotted), per https://simonwillison.net/2023/Apr/30.
   - Not confirmed that Astro docs or Starlight use `astro-og-canvas`.
6. **Galleries and preview tools.**
   - https://opengraphexamples.com: a gallery of real OG cards with a category filter and a debugger; leans SaaS.
   - https://www.opengraph.xyz: a multi-platform preview tool (returned HTTP 429; features unverified).
   - Official debuggers: the Facebook Sharing Debugger and LinkedIn Post Inspector. The X Card Validator is no longer a reliable check, so test by posting.

**Pattern fit:** Tailwind's "dark grid plus spec sheet plus wordmark" maps onto this site, which already has the 30px grid, a bordered spec-sheet card with mono labels, and an accent word. It generalises to per-topic cards: keep the background and frame, and swap in a topic title, a mono label such as "TOPIC 03 / FEEDBACK LOOPS", and the topic's diagram colour or line art. GitHub's "big title, small description, small footer meta" shows the text hierarchy to follow.

**Caveats:**

- No-image fallback behaviour, Slack and Discord cache lifetimes, the LinkedIn TTL and X limits are from secondary sources or memory. Verify with the debuggers after deploying.
- `astro-og-canvas` version and Astro 7 compatibility were not stated. Check its CHANGELOG before adopting it.
- No build-time or package-size numbers were found for Satori or `astro-og-canvas`.
- Confirm no redirect or bot-protection rule blocks crawlers from `/og.png`.
