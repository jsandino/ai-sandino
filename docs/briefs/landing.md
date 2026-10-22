# Brief — Landing page (`/`)

- **Status:** Done
- **Roadmap:** [phase 002](../roadmap/phase-002.md), step 7
- **Source:** kickoff "Landing page concept"; ADR 0008 (routes,
  `topics.ts`); ADR 0009 + `design-system.md` (look); design references in
  `docs/design/` (below)

## Purpose

Tell a visitor in seconds what this site is, and let them pick a topic.
The topic graph is the site's primary navigation, and its "wow" entry
point: fun, beautiful and interactive.

## Design references

Build to these; they are working prototypes, not throwaway sketches. Where
a reference and this brief disagree, the brief wins.

| Reference | What to take from it |
|---|---|
| [`design/landing-hero.html`](../design/landing-hero.html) | The whole page: hero, page-wide grid and beams, feathered graph panel, card, footer, phone layout |
| [`design/graph-edges.html`](../design/graph-edges.html), right panel and phone panel | Graph nodes, spokes, related links, "AI" hub and its spark, hover/focus/tap behaviour, topic card, portrait layout settings (`PHONE`) |
| [`design/graph-layouts.html`](../design/graph-layouts.html), panel A | The force-directed entrance: off-screen layout, eased glide from the centre, fade/grow/sharpen, links drawing in, live ripple, breathing, drag |

## Required content

1. **Hero:** the title "Practical AI **engineering**", with "engineering" in
   `accent-strong`, and the supporting line (see *Decided* #7).
2. **Topic graph:** all five topics from `src/data/topics.ts`, as specified
   in *Decided* #1–#5.
3. **Topic card** under the graph (*Decided* #5).
4. **Backdrop:** grid and falling beams behind the whole page, with the
   graph and card on a feathered panel (*Decided* #6).
5. **No-JavaScript fallback:** the topics render first as a plain HTML list
   under the heading "Topics" (live topics as links, each with its blurb),
   which the script enhances into the graph. Search engines, screen readers
   and no-JS visitors get the same content.
6. **Topic data:** `topics.ts` gains `related` (*Decided* #3) and the blurbs
   from `docs/content/topic-blurbs.md` (*Decided* #8).

Use only the D3 modules the graph needs (`d3-force`, `d3-selection`,
`d3-transition`, `d3-timer`, `d3-drag`, `d3-ease`), not the full `d3`
bundle, to stay inside the Lighthouse performance budget.

## Decided

1. **No live topic yet.** All five topics stay `coming-soon` in this build;
   step 8 takes Harness Engineering live in the same PR as its page. The
   graph fully supports live nodes now: live-node behaviour is tested with
   fixture data in unit tests, since the real build has none.
2. **Layout: force-directed**, behaving as panel A of `graph-layouts.html`.
   The layout is computed off-screen to rest, then each topic glides from
   the centre to its place (ease-out, staggered) while fading, growing and
   sharpening in; links draw in after their nodes; a live node ripples once
   when it lands; at rest the graph breathes gently (≤ ~2px); nodes can be
   dragged after the entrance. Under reduced motion the settled graph
   appears at once and nothing moves. Positions may vary by screen; tests
   check structure, never coordinates.
3. **Edges: hub and spokes plus related links**, as the right panel of
   `graph-edges.html`.
   - A central hub labelled **AI** joins every topic with a solid spoke. The
     hub sparks: a jagged accent arc sweeps about half a lap around it every
     2.5–5s, starting after the entrance; never under reduced motion.
   - Faint dashed cross-links join related topics, from `related` in
     `topics.ts`: Transformers ↔ RAG, RAG ↔ LLM gateways, LLM gateways ↔
     Agents with ADK, Agents with ADK ↔ Harness Engineering. They pull the
     layout gently. No labels on links.
4. **Mobile:** below 640px wide, the same graph is laid out in a 360×560
   portrait frame (the `PHONE` settings in `graph-edges.html`), labels at
   full size. Tap replaces hover (*Decided* #5).
5. **Topic card and interaction.** A card under the graph shows the focused
   topic's title, a status badge and its blurb, plus "Read the topic →" when
   it is live; with nothing selected it shows a prompt. The graph shows no
   "coming soon" tags (only "live" on live nodes).
   - Desktop: hover or keyboard focus previews a topic (it grows, its
     related topics and links light up in the accent, the rest dims, the
     card fills). Clicking a live node, or pressing Enter on it, opens
     `/<slug>`.
   - Phone: a tap selects a topic (same highlight, card fills) and a second
     tap clears it; the card's link opens a live topic.
   - The card is an `aria-live="polite"` region.
6. **Backdrop**, as `landing-hero.html`: the 30px grid and six falling beams
   behind the whole page (`design-system.md`, *Background grid* and *Falling
   beams*), decorative and `aria-hidden`. The graph and card sit on a
   square, borderless feathered panel (*Feathered panel*), so no beam
   crosses the graph. Under reduced motion the beams are hidden and the grid
   is static.
7. **Wording.** Exactly this text:

   | Where | Text |
   |---|---|
   | Hero supporting line | Learn how AI systems actually get built — explained visually, backed by real projects. |
   | Hub label | AI |
   | Card, nothing selected | Pick a topic to see what it covers. |
   | Card status badges | Live / Coming soon |
   | Card link (live topics) | Read the topic → |
   | Graph accessible name | The five topics, as a graph. |
   | No-JS list heading | Topics |
   | Page title / meta description | Unchanged from the shell |

8. **Blurbs** come from
   [`docs/content/topic-blurbs.md`](../content/topic-blurbs.md): the teaser
   for each coming-soon topic, and the full blurb for Harness Engineering
   (from the start). They replace the shell's placeholders.

## Acceptance criteria

| # | Criterion | Check |
|---|---|---|
| 1 | All five topics appear in the graph and the no-JS list, from `topics.ts` only | `make test-e2e` |
| 2 | Topic data → graph nodes and links: one spoke per topic, one cross-link per `related` pair, both ends existing topics | `make test-unit` |
| 3 | A live topic renders as a link to `/<slug>` and a coming-soon topic doesn't, in the graph data and the no-JS list | `make test-unit` (fixtures with a live topic) |
| 4 | In this build no node is a link (all coming soon) | `make test-e2e` |
| 5 | `topics.ts` blurbs match `topic-blurbs.md` for each topic's status | `make test-unit` |
| 6 | Hero title has the accent on "engineering"; every string in *Decided* #7 appears exactly | `make test-e2e` |
| 7 | With JavaScript off, the "Topics" list shows every topic with its blurb | `make test-e2e` |
| 8 | Hover and keyboard focus fill the card with the topic's title, badge and blurb; idle shows the prompt | `make test-e2e` |
| 9 | Keyboard: every topic is focusable with a visible focus style; Enter opens a live topic (fixture page or unit level) | `make test-e2e` + `make test-unit` |
| 10 | At 360px wide, the portrait layout is used and every node and label fits inside the frame | `make test-e2e` |
| 11 | On a narrow touch viewport, tapping a topic selects it and fills the card, without navigating | `make test-e2e` |
| 12 | The entrance is smooth: no node moves back toward the centre while gliding out | `make test-e2e` (sampled positions) |
| 13 | The hub is labelled "AI" and a spark appears within 8s of load | `make test-e2e` |
| 14 | Under reduced motion: no running animations, no spark, beams hidden | `make test-e2e` |
| 15 | Grid, beams and spark are `aria-hidden`; the card is `aria-live` | `make test-e2e` |
| 16 | Visual match to the design references in both themes and on a phone, including the feathered panel and beams | human review (Cloudflare preview) |
| 17 | CI passes: format, lint, types, unit, build, link check, Lighthouse (mobile), e2e with axe | CI |

## Out of scope

Search, filtering, a blog, analytics, taking any topic live (step 8),
labels on links.
