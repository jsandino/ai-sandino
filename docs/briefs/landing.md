# Brief — Landing page (`/`)

- **Status:** Draft
- **Roadmap:** [phase 002](../roadmap/phase-002.md), step 7
- **Source:** kickoff "Landing page concept"; ADR 0008 (routes,
  `topics.ts`); ADR 0009 + `design-system.md` (look)

## Purpose

Tell a visitor in seconds what this site is, and let them pick a topic.
The node graph is the site's primary navigation.

## Required content

1. **Brief intro:** what the site is about. Hero title
   "Practical AI **engineering**" (accent on "engineering"), one supporting
   line, site name small in the nav only.
2. **Node graph (D3):** one node per topic, all five always visible.
   - **Live** topic: accent node; clicking it navigates to the topic page.
   - **Coming-soon** topics: visible but clearly unfinished (muted, dashed),
     labelled "coming soon", **not** links. Not hidden, not broken.
   - Graph data comes only from `src/data/topics.ts`.

## Behaviour

- Clicking or activating a live node goes to `/<slug>`.
- Coming-soon nodes don't navigate; hover/focus may show the blurb.
- Entrance animation per the design system (fade-up/line-draw); everything
  respects `prefers-reduced-motion`.

## Accessibility, performance, mobile _(added)_

- **Works without JavaScript:** the topics render first as a plain HTML
  list (links for live topics), which D3 then enhances into the graph.
  Search engines, screen readers and no-JS visitors get the same content.
- Keyboard: live nodes are focusable links with visible focus; coming-soon
  nodes are announced as "coming soon".
- Mobile-first: the graph is readable and tappable on a 360px-wide screen.
- Must pass CI: Lighthouse (mobile) ≥ 0.95 accessibility/best-practices/SEO,
  ≥ 0.90 performance; link check.

## Acceptance criteria

- [ ] All five topics appear, from `topics.ts` only.
- [ ] The live node links to its page; coming-soon nodes don't link.
- [ ] Taking a topic live is a one-line change in `topics.ts` (plus its page).
- [ ] With JavaScript off, every topic is still listed and live ones link.
- [ ] Keyboard-only and screen-reader use work.
- [ ] Reduced-motion users see no movement.
- [ ] CI passes. Graph logic (data → nodes/links) has Vitest tests
      (L4 arrives with the graph, per `development.md`).

## Open questions (settle before building the graph)

1. **Layout:** force-directed (organic, moves) or fixed positions (stable,
   designed)?
2. **Edges:** what does a line between two topics mean, or are there none?
3. **Mobile:** same graph scaled down, or a different arrangement?
4. **Topic blurbs:** final copy for all five (the shell shipped
   placeholders in `topics.ts`).

## Out of scope

Search, filtering, a blog, analytics.
