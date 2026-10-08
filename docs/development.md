# Development

How to work on this project: commands, git workflow, and the checks that
guard each change. Tools to install first: [`prerequisites.md`](prerequisites.md).

---

## make

Every command (run, build, check and dependency changes) goes through `make`,
for humans and agents, locally and in CI. The command that passes on your
machine is the command CI runs ([ADR 0005](decisions/0005-make-command-interface.md)).

`make help` lists every target with its description.

| Target | Runs |
|---|---|
| `make ci` | `npm ci`: install dependencies exactly as locked (also installs the git hooks) |
| `make install PKG=x` | `npm install x`: add a runtime dependency |
| `make dev-install PKG=x` | `npm install -D x`: add a dev dependency |
| `make uninstall PKG=x` | `npm uninstall x` |
| `make dev` | Astro dev server |
| `make build` | Production build into `dist/` |
| `make linkcheck` | Internal links and anchors in `dist/` and the repo's Markdown |
| `make lighthouse` | Lighthouse audit of `dist/` against the score thresholds |
| `make pdf-check` | Fail if guide source changed after the last PDF rebuild |
| `make pdf` | Rebuild `public/harness-guide.pdf` |
| `make clean` | Remove `build/` intermediates (keeps the committed PDF) |
| `make help` | List targets |

### Conventions

- **Recipes are one-line aliases.** As soon as a target needs logic (a
  guard, a condition, `||`, `test`), the logic moves into a bash script in
  `scripts/` and the target calls it. The Makefile stays readable at a glance.
- **Names mirror the underlying tool** (`ci`, `install`, `dev-install`,
  `uninstall`), so nothing needs translating.
- **Every target has a `## description` comment.** That's what `make help`
  prints.
- **Missing a command? Add a target** rather than calling npm or npx
  directly.
- Pass arguments as variables (`make <target> PKG=…`). Bare words after the
  target name are treated as more targets.

---

## Git workflow

[ADR 0004](decisions/0004-branch-pr-workflow.md)

1. Branch from an up-to-date `main`: `feat/…`, `fix/…`, `chore/…`, `docs/…`.
2. Commit using [Conventional Commits](https://www.conventionalcommits.org/):
   an imperative title, then one paragraph on **why**.
3. Push and open a PR. CI runs, and Cloudflare posts a preview deploy.
4. Javier reviews and merges (**rebase merge**). Agents never merge.
5. `main` is protected: no direct pushes, and CI must pass before merging.

### Branch protection

GitHub ruleset **`protect-main`** (Settings → Rules → Rulesets), applied by
hand. Agents never change it.

| Setting | Value |
|---|---|
| Target | Default branch, enforcement **Active** |
| Bypass list | Empty, so admins can't bypass it either |
| Restrict deletions / Block force pushes | On |
| Require a pull request | On; 0 approvals; merge method **rebase** only |
| Require status checks | `site`, `pdf` (the CI jobs) |

---

## Enforcement layers

Each layer catches a different class of mistake, as early as possible.

| Layer | Tool | Runs on | Status |
|---|---|---|---|
| L1: format & lint | Prettier (Astro + Tailwind plugins), ESLint (`eslint-plugin-astro`) | Pre-commit with auto-fix; CI in check mode | planned (tooling PR) |
| L2: types | `astro check` (strict TS) | Pre-commit + CI | planned (tooling PR) |
| L3: project checks | Scripts in `tools/` | Pre-commit + CI | Added only when a rule earns one |
| L4: tests | none yet; Vitest arrives with the D3 graph | none | The Astro build is the test for now |
| CI gates | build, links, Lighthouse, PDF freshness (see [CI](#ci)) | Every PR | available |
| PDF freshness | `scripts/precommit-build-pdf.sh` | Pre-commit | available |

Hooks are defined in `lefthook.yml` and installed automatically when the
project's dependencies are installed. When a check fails, its message says
what rule broke, where, why, and how to fix it. Fix the cause; never
`--no-verify` around it.

### The PDF hook

When files under `src/content/harness-guide/` are staged, the hook:

| Situation | Action |
|---|---|
| PDF not staged | Rebuilds and stages `public/harness-guide.pdf` |
| PDF staged and newer than every staged source file | Skips; you already built it |
| PDF staged but older than a staged source file | Rebuilds and stages it |

A build failure blocks the commit, naming the failing chapter. Changing the
chapter order in `scripts/guide-files.sh` does **not** trigger the hook; run
`make pdf` yourself.

---

## CI

`.github/workflows/ci.yml` runs on every PR to `main`
([ADR 0010](decisions/0010-ci-checks-and-gates.md)). Every step is a `make`
target, so any failure can be reproduced locally with the same command.

| Job | Steps | Notes |
|---|---|---|
| `site` | `make ci` → `make build` → `make linkcheck` → `make lighthouse` | Lighthouse reports are uploaded as the `lighthouse-reports` artifact, even on failure |
| `pdf` | `make pdf-check` | Checks out full history (`fetch-depth: 0`) to compare commit order |

**Link check:** internal links and anchors only, in `dist/` (hyperlink) and
in `README.md`, `CLAUDE.md`, `docs/` and `research/` (remark-validate-links,
configured in `.remarkrc.mjs`). The guide source is excluded because it's
print-only.

**Lighthouse thresholds** (`lighthouserc.json`): mobile, median of 3 runs.
Accessibility, best practices and SEO must score at least 0.95, and
performance at least 0.90. A failing page is listed with its category; the
HTML reports are in `.lighthouseci/` locally, or in the artifact on CI.
