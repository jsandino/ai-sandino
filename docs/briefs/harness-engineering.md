# Brief — Harness Engineering topic page (`/harness-engineering`)

- **Status:** Done
- **Roadmap:** [phase 002](../roadmap/phase-002.md), step 12
- **Source:** kickoff "Harness Engineering topic page"; ADR 0018 (page
  content drawn from the guide); ADR 0003 (vanilla Motion);
  `design-system.md`; the guide (`src/content/harness-guide/`)

## Purpose

Show the shape of the whole guide at a glance, then hand the reader the full
guide (PDF) and a real project. The page is a map that builds intuition: a
graph of the guide's six parts around the heuristics, and the twelve
heuristics worth remembering.
The guide is the reference.

## Scope of this brief

This brief builds the page frame: the graph and the heuristics cards. What
happens when a reader hovers or selects a node (a card, a page, or a visual
shown in place) is **not decided here**. A follow-up brief settles it. Until
then, nodes show their label and, as on the landing graph, dim the rest of
the graph and light up their own edge on hover.

## Required sections (in order)

1. **Hero:** introduces the topic: what harness engineering is, in one or
   two lines.
2. **Primary building blocks:** a graph of a centre node and six part
   nodes, one per part of the guide, in a fixed hand-placed layout (see
   *Graph*), entering on scroll.
3. **The twelve heuristics:** twelve cards (see *Heuristics*).
4. **PDF download:** a button linking to `/harness-guide.pdf`.
5. **GitHub link:** to the companion project, this repo:
   `https://github.com/jsandino/ai-sandino#practical-ai-engineering`.

Sections are clearly separated visually (alternating bands, per the design
system).

## Copy

All user-facing text on the page. "Placeholder OK" marks plain labels that
may be reworded later without a new brief.

| Where | Text | Source |
|---|---|---|
| Hero title | Harness Engineering with Code Agents | `docs/content/topic-blurbs.md` |
| Hero line | Build the environment around a coding agent (context, constraints, capabilities and feedback loops) so it ships reliable software, not plausible guesses. | `docs/content/topic-blurbs.md` |
| Graph heading | Primary building blocks | placeholder OK |
| Heuristics heading | Twelve heuristics | placeholder OK |
| Heuristics sub-line | Harness-engineering ideas worth remembering. | guide `02-heuristics.md` |
| PDF button | Download the guide (PDF) | placeholder OK |
| PDF caption | A Practical Guide to Harness Engineering | guide `00-intro.md` |
| GitHub text | This site was built using these principles. | placeholder OK |
| GitHub link | Browse the source on GitHub | placeholder OK |

## Content rules

- Text is taken from the guide (ADR 0018), as listed below. The page is
  authored as an Astro page; don't render the guide's chapters.
- Short and visual over long prose; the guide holds the depth.

## Graph

Drawn like the landing topic graph: an SVG of rings over centre-to-centre
edges, with the same entrance, rest and hover behaviour
(`docs/design-system.md#motion`). A centre node, **Heuristics**, connects to
six part nodes, one per part. Each part's summary (the part's epigraph in
the guide, except Part I's, which is a quote from §1) is not shown yet; it is
in the screen-reader text, and the follow-up brief uses it:

| Part | Label | Summary |
|---|---|---|
| I | Foundations | An agent without a harness is a guess generator. An agent with a harness is a force multiplier. |
| II | Context architecture | Context is the substrate of every agent task. If it's wrong, nothing downstream can recover. |
| III | Mechanical constraints | If a rule matters, make it mechanical. Prose drifts, checks don't. |
| IV | Agent capabilities | Skills are for workflows; docs are for knowledge. The wrong mechanism is worse than no mechanism. |
| V | Feedback loops | The harness fails where you aren't looking. |
| VI | Operating discipline | The repo outlives the session, the model, and the conversation. |

- Nodes (*Decided*): small circles with the label outside, and no part
  numeral or summary. All six parts use the landing graph's *live* style
  (green ring, glow, dot, bold label); the hub is a gray ring with its label
  inside, and sparks like the landing graph's `AI` node. There are no
  per-part colours.
- Edges (*Decided*): the hub connects to each part (six gray edges). There
  are no other edges: the frame edges from Parts I and VI and the arrows
  between the primitives were dropped, as they crowded the diagram. Edges
  draw in after the nodes appear.
- Hover (*Decided*): hovering a part dims the other parts, lights up its
  edge and grows the node. The hub stays lit. A tap selects on touch.
- Layout (*Decided*): fixed and hand-placed, no force simulation. The hub is
  in the middle, Part I on its left and Part VI on its right, and the four
  primitives at the corners (Parts IV and II on top, V and III below). The
  phone layout has the same arrangement in a narrow frame, with labels
  wrapped.

## Heuristics

Twelve cards, in the guide's order. Each card shows its number, its name
(for example "map vs. territory") and its one-sentence statement, taken
verbatim from `02-heuristics.md`. Cards are not links. On wide screens they
form a grid; on phone width, a single column.

## Accessibility, performance, mobile

- The graph has a text equivalent (the six parts, their summaries and the
  links between them as readable text), so screen readers and no-JS visitors
  get the content.
- Readable and usable at 360px wide; the graph switches to the phone layout
  rather than shrinking to illegible.
- All motion respects `prefers-reduced-motion`.
- Must pass CI (Lighthouse thresholds, link check; the PDF link is checked).

## Acceptance criteria

- [ ] The page exists at `/harness-engineering`, using the shared shell.
      → check: `make test-e2e`
- [ ] `topics.ts` marks the topic `live`, with `pdf: "/harness-guide.pdf"`,
      in the same PR as the page (the live ⇔ page check passes).
      → check: `make test-unit`
- [ ] All five sections are present, in order, visually separated.
      → check: `make test-e2e` (section order); separation → human review
- [ ] The graph shows the hub and six part nodes with the labels above, and
      the six edges between them. → check: `make test-e2e`
- [ ] The graph animates on scroll, reacts to hover, and has a text
      equivalent.
      → check: `make test-e2e` (text equivalent); animation → human review
- [ ] Twelve heuristic cards appear in order, with the guide's text.
      → check: `make test-e2e` (count and order); wording → human review
- [ ] The PDF downloads. → check: `make linkcheck`
- [ ] All text matches the *Copy* table. → human review
- [ ] The GitHub link points to `https://github.com/jsandino/ai-sandino#practical-ai-engineering`.
      → human review (`make linkcheck` covers internal links only)
- [ ] Reduced motion, keyboard and mobile all work.
      → check: `make test-e2e` (axe, reduced motion, 360px)
- [ ] Every CI check passes. → check: `make format-check`, `make lint`,
      `make typecheck`, `make test-unit`, `make build`, `make linkcheck`,
      `make lighthouse`, `make test-e2e`, `make pdf-check`

## Open questions

1. ~~**GitHub project:** which repo?~~ Decided: this repo,
   `https://github.com/jsandino/ai-sandino#practical-ai-engineering`. No placeholder state.
2. ~~**The 12 heuristics:** add them as a section?~~ Decided: yes, as twelve
   cards below the graph, with the guide's wording. [ADR 0018](../decisions/0018-topic-page-content-sources.md)
   supersedes ADR 0007's hand-written rule to allow it.
3. ~~**Key concepts visuals:** a diagram per concept?~~ Decided: dropped. The
   graph replaces the key-concepts section.
4. ~~**Graph edges and layout:**~~ Decided: see *Graph*.
5. ~~**Does ADR 0007 need superseding?**~~ Decided: yes, by ADR 0018.
6. ~~**Hero copy and section headings**~~ Decided: see *Copy*.

## Out of scope

The card shown when a node is hovered or selected (follow-up brief), rendering guide chapters on the web,
comments, newsletter sign-up.
