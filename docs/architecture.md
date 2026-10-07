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
| `/rag-in-production` | Topic 2 (coming soon) |
| `/llm-gateway` | Topic 3 (coming soon) |
| `/transformer-architecture` | Topic 4 (coming soon) |
| `/agents-with-adk` | Topic 5 (coming soon) |

A coming-soon topic has **no page**. Its node is shown on the landing graph,
styled as unfinished, and is not a link.

## Topic data: one source

`src/data/topics.ts` is the single source of facts about topics. The landing
graph, the topic pages and any navigation all read from it.

```ts
type Topic = {
  slug: string;                       // URL path, e.g. "harness-engineering"
  title: string;
  blurb: string;                      // one or two sentences
  status: "live" | "coming-soon";
  pdf?: string;                       // e.g. "/harness-guide.pdf"
  github?: string;                    // project repo URL
};
```

Taking a topic live is one change: its `status` goes from `"coming-soon"` to
`"live"`, in the same PR that adds its page. A build-time check enforces
**live ⇔ page exists**, so the graph can never link to a missing page or hide
a finished one.

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

- Each topic page is **written by hand** for the web, using its guide as a
  reference ([ADR 0007](decisions/0007-hand-written-topic-pages.md),
  provisional).
- Guide source Markdown lives in `src/content/<guide>/` and is used **only**
  to build the PDF. The site does not render it.
- Mermaid diagrams are rendered for the PDF only. Web rendering is put off
  until a page needs it ([ADR 0006](decisions/0006-defer-web-mermaid.md)).

## PDF pipeline

```
src/content/harness-guide/*.md
   │  scripts/render-diagrams.sh   (Mermaid → cropped PDF images, build/rendered/)
   ▼
build/rendered/
   │  scripts/build-pdf.sh         (pandoc + xelatex, one pass)
   ▼
public/harness-guide.pdf           (committed; served as a static file)
```

`make pdf` runs both steps. The chapter order lives in
`scripts/guide-files.sh`, shared by both scripts. The pre-commit hook rebuilds
the PDF when guide source is staged
([ADR 0002](decisions/0002-commit-pdf-rebuild-in-hook.md)); see
[`development.md`](development.md#the-pdf-hook).

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
| `src/content/` | Guide source Markdown (PDF only) |
| `src/styles/` | Global CSS and Tailwind theme tokens |
| `public/` | Static files served as-is, including committed PDFs |
| `scripts/` | Bash scripts behind `make` targets and git hooks |
| `tools/` | Custom project checks (enforcement layer 3) |
| `docs/` | System of record |
| `research/` | Researcher sub-agent summaries |
| `.claude/` | Agent configuration (sub-agents, settings) |

Folders are created when first needed. Some above don't exist yet.
