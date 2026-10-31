# Architecture

How the site is put together. For *why* each piece was chosen, follow the
ADR links.

---

## Pages and routes

Flat slugs, one per topic, plus the landing page ([ADR 0008](decisions/0008-flat-urls-and-topics-data.md)):

| Route | Page |
|---|---|
| `/` | Landing: short intro + node graph of the five topics |
| `/harness-engineering` | Topic 1 (live first) |
| `/heuristics` | The twelve heuristics, linked from topic 1's graph (not a topic) |
| `/rag-in-production` | Topic 2 (coming soon) |
| `/llm-gateway` | Topic 3 (coming soon) |
| `/transformer-architecture` | Topic 4 (coming soon) |
| `/agents-with-adk` | Topic 5 (coming soon) |

Every route is slash-less except `/`. Pages are built as `<slug>.html`,
which Cloudflare Pages serves at `/<slug>` with no redirect
([ADR 0014](decisions/0014-file-format-no-trailing-slash.md)); the 404 page
is `404.html` at the root. `tests/e2e/urls.spec.ts` enforces this.

A coming-soon topic has **no page**. Its node is shown on the landing graph,
styled as unfinished, and is not a link.

## Topic data: one source

`src/data/topics.ts` is the single source of facts about topics. The landing
graph, the topic pages and any navigation all read from it.

```ts
type Topic = {
  slug: string;                       // URL path, e.g. "harness-engineering"
  title: string;
  label: string;                      // short name on the landing graph node
  blurb: string;                      // teaser or full blurb, from docs/content/topic-blurbs.md
  status: "live" | "coming-soon";
  related?: string[];                 // slugs of related topics (graph cross-links)
  pdf?: string;                       // e.g. "/harness-guide.pdf"
  github?: string;                    // project repo URL
};
```

Taking a topic live is one change: its `status` goes from `"coming-soon"` to
`"live"`, in the same PR that adds its page. A unit test
(`tests/unit/topics.test.ts`, run by `make test-unit` in pre-commit and CI)
enforces **live ⇔ page exists**, so the graph can never link to a missing
page or hide a finished one.

`blurb` comes from [`docs/content/topic-blurbs.md`](content/topic-blurbs.md):
the teaser while a topic is coming soon, the full blurb once it is live (a
unit test checks they match). `related` lists the topics a graph cross-link
joins; each pair is listed on one side only. `src/lib/topic-graph.ts` turns
the data into the graph's nodes and links (a hub, one spoke per topic, one
cross-link per pair), and unit tests feed it fixtures with live topics.

## Pages and interactivity

- Pages are static Astro components. JavaScript ships only where something
  moves or responds.
- Animation uses **vanilla Motion** (`animate`, `inView`, `scroll`) in small
  client-side scripts inside Astro components. There is no React
  ([ADR 0003](decisions/0003-vanilla-motion-no-react.md)). The landing graph
  is vanilla D3.
- Every page shares one layout (the "shell": header, typography, colour
  tokens, footer). Each topic page chooses its own content density inside
  that shell. See [`design-system.md`](design-system.md).

## Topic content and the companion guide

- A topic page's content may be written by hand, taken from its guide, or
  generated from it ([ADR 0018](decisions/0018-topic-page-content-sources.md)).
  Today pages are authored as Astro pages.
- Guide source Markdown lives in `src/content/<guide>/` and is used **only**
  to build the PDF. The build does not read it for the site.
- Mermaid diagrams are rendered for the PDF only. Web rendering is put off
  until a page needs it ([ADR 0006](decisions/0006-defer-web-mermaid.md)).

## PDF pipeline

Every guide follows one format
([`guide-format.md`](guide-format.md),
[ADR 0016](decisions/0016-guide-format-and-generic-pdf-pipeline.md)), so one
pipeline builds them all. For each guide:

```
src/content/<guide>/[0-9][0-9]-*.md, metadata.yml
   │  scripts/render-diagrams.sh   (Mermaid → cropped PDF images, link rewrite, glyphs)
   ▼
build/<guide>/rendered/
   │  scripts/build-pdf.sh         (cover from metadata.yml; pandoc + xelatex, one pass)
   ▼
public/<guide>.pdf                 (committed; served as a static file)
```

`scripts/build-pdf.sh` drives both steps; `make pdf` runs it for every guide,
`make pdf GUIDE=<guide>` for one. `scripts/pdf/guides.sh` finds the guides
and their chapters for every PDF script. In `scripts/pdf/`:

- `fields.txt`: a pandoc template that prints `metadata.yml`'s fields for
  the shell, so no YAML parser is needed.
- `cover.tex`: the cover template, filled by pandoc from `metadata.yml`
  and passed to the main conversion with `--include-before-body`. The main
  conversion gets only `title-meta`/`author-meta`, never `title`/`author`,
  which would add a second title block.
- `contents-filter.mjs`: a pandoc filter that marks the headings the
  contents must not list. The pipeline puts `\tableofcontents` after the
  first chapter and a page break before every chapter.

Fonts, page geometry and link colours are set once in `build-pdf.sh`, shared
by every guide. The pre-commit hook rebuilds the PDF of each guide whose
source is staged ([ADR 0002](decisions/0002-commit-pdf-rebuild-in-hook.md));
see [`development.md`](development.md#the-pdf-hook).

## Build and deploy

- `main` is protected. Changes arrive only through PRs
  ([ADR 0004](decisions/0004-branch-pr-workflow.md)).
- Cloudflare Pages builds and deploys every merge to `main`, and builds a
  preview for every PR.
- CI runs on every PR (see [`development.md`](development.md#ci)).

## Repository layout

Directory roles, not file lists. Docs are listed in the
[routing table](README.md#where-to-look).

| Path | Role |
|---|---|
| `src/pages/` | Routes (one file per page) |
| `src/components/` | Astro components, including islands with client scripts |
| `src/layouts/` | The shared page shell |
| `src/data/` | Typed data, e.g. `topics.ts` |
| `src/lib/` | Pure logic shared by pages, scripts and tests (no DOM) |
| `src/scripts/` | Client-side scripts too large to inline in a component |
| `src/content/` | Guide source Markdown (PDF only) |
| `src/styles/` | Global CSS and Tailwind theme tokens |
| `public/` | Static files served as-is, including committed PDFs |
| `scripts/` | Bash scripts behind `make` targets and git hooks |
| `tests/` | `unit/` (Vitest) and `e2e/` (Playwright + axe) |
| `tools/` | Custom project checks (enforcement layer 3) |
| `docs/` | System of record |
| `research/` | Researcher sub-agent summaries |
| `.claude/` | Agent configuration (sub-agents, settings) |

Folders are created when first needed. Some above don't exist yet.
