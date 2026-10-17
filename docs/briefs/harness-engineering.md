# Brief — Harness Engineering topic page (`/harness-engineering`)

- **Status:** Draft
- **Roadmap:** [phase 002](../roadmap/phase-002.md), step 8
- **Source:** kickoff "Harness Engineering topic page"; ADR 0007 (written
  by hand from the guide, provisional); ADR 0003 (vanilla Motion);
  `design-system.md`

## Purpose

Teach the core ideas of harness engineering in a few minutes of scrolling,
visually, then hand the reader the full guide (PDF) and a real project.
The page is a summary that builds intuition; the guide is the reference.

## Required sections (in order)

1. **Hero:** introduces the topic: what harness engineering is, in one or
   two lines.
2. **The four primitives:** an animated diagram of context, constraints,
   capabilities and feedback loops, entering on scroll, built with Motion.
   Uses the four primitive colours from `design-system.md`.
3. **Key concepts:** progressive disclosure, ADRs, mechanical enforcement,
   feedback loops. Each one gets a short, visual explanation.
4. **PDF download:** a button linking to `/harness-guide.pdf`.
5. **GitHub link:** to the companion project. **Placeholder for now**
   (repo not chosen yet; see Open questions).

Sections are clearly separated visually (alternating bands, per the design
system).

## Content rules

- Written by hand for the web, using the guide (`src/content/harness-guide/`)
  as reference. Don't render the guide's Markdown (ADR 0007).
- Short and visual over long prose; the guide holds the depth.

## Diagram detail _(added, from guide §3)_

The guide shows the primitives reinforcing each other, and the diagram
should too: context → constraints, constraints → feedback loops,
capabilities → context, feedback loops → context. Arrows draw in after the
four nodes appear (line-draw animation).

## Accessibility, performance, mobile

- The diagram has a text equivalent (the four primitives and their links
  as readable text), so screen readers and no-JS visitors get the content.
- Readable and usable at 360px wide; the diagram reflows rather than
  shrinking to illegible.
- All motion respects `prefers-reduced-motion`.
- Must pass CI (Lighthouse thresholds, link check; the PDF link is checked).

## Acceptance criteria

- [ ] The page exists at `/harness-engineering`, using the shared shell.
- [ ] `topics.ts` marks the topic `live`, with `pdf: "/harness-guide.pdf"`,
      in the same PR as the page (the live ⇔ page check passes).
- [ ] All five sections are present, in order, visually separated.
- [ ] The primitives diagram animates on scroll and has a text equivalent.
- [ ] The PDF downloads; the GitHub link is a clearly marked placeholder.
- [ ] Reduced motion, keyboard and mobile all work; CI passes.

## Open questions

1. **GitHub project:** which repo? Until it's decided, should the link be
   hidden, or shown as "coming soon"?
2. **The 12 heuristics:** add them as a section, embedded from the guide's
   `02-heuristics.md`? This is ADR 0007's open "option C".
3. **Key concepts visuals:** a diagram per concept, or a shared card
   pattern with small illustrations?

## Out of scope

Rendering guide chapters on the web, comments, newsletter sign-up.
