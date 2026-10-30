[![CI](https://github.com/jsandino/ai-sandino/actions/workflows/ci.yml/badge.svg)](https://github.com/jsandino/ai-sandino/actions/workflows/ci.yml)

# Practical AI Engineering

Learn AI engineering through interactive pages, companion PDF guides and
working code.

**[Visit ai.sandino.ca →](https://ai.sandino.ca)**

This repo is the source of the site.

## Built with what it teaches

This project was built from day one using the harness engineering
principles taught on the site. The harness is all in the repo:

- **A system of record:** [docs/](docs/README.md) says what the project is
  and what to work on next, so an agent never has to guess.
- **Recorded decisions:** [ADRs](docs/decisions/) capture why each
  non-obvious choice was made.
- **Briefs and a roadmap:** [briefs](docs/briefs/) say what each page must
  contain, and the [roadmap](docs/roadmap/README.md) says in what order.
- **Rules for agents:** [CLAUDE.md](CLAUDE.md) sets how an agent behaves
  here, including what it must never do.
- **Automated checks:** git hooks ([lefthook.yml](lefthook.yml)) and
  [CI](.github/workflows/ci.yml) enforce the rules, so they don't depend on
  anyone remembering them.

## Quick start

```bash
make ci      # install dependencies from the lockfile
make dev     # local dev server
make help    # every other command
```

## Working on the project

Everything about how the project works (architecture, design system,
decisions, current status) lives in [docs/](docs/README.md).
AI agents: start with [CLAUDE.md](CLAUDE.md). Building the PDF guides needs
extra tools: see [docs/prerequisites.md](docs/prerequisites.md).

Built with [Astro](https://astro.build) and [Tailwind CSS](https://tailwindcss.com),
deployed on [Cloudflare Pages](https://pages.cloudflare.com).

## Topics

Each topic gets an interactive page, a companion PDF guide and a GitHub
project. Harness Engineering is first; the rest are on the way.

| Topic | Status |
|---|---|
| Harness Engineering with Code Agents | Live |
| The Transformer architecture: a deep dive | In progress |
| LLM gateways: managing token quotas | Coming soon |
| RAG in production | Coming soon |
| Building an autonomous agent with Google's ADK | Coming soon |
