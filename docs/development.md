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
| `make format` | Format code and config with Prettier (rewrites files) |
| `make format-check` | Fail if any file is not formatted (CI) |
| `make lint` | Fail on any ESLint error or warning (CI) |
| `make lint-fix` | Apply ESLint's automatic fixes (rewrites files) |
| `make typecheck` | `astro check` on the whole project; fails on errors or warnings |
| `make linkcheck` | Internal links and anchors in `dist/` and the repo's Markdown |
| `make lighthouse` | Lighthouse audit of `dist/` against the score thresholds |
| `make test-unit` | Vitest unit tests in `tests/unit/` |
| `make test-e2e` | Playwright + axe tests in `tests/e2e/`, against `astro preview` of `dist/` (build first); `GREP=<pattern>` runs only matching tests |
| `make test` | `test-unit`, then `test-e2e` |
| `make browsers` | Install the Chromium headless shell the e2e tests use (once per Playwright version) |
| `make pdf-check` | Fail if any guide's source changed after its PDF was last rebuilt |
| `make pdf` | Rebuild every guide's `public/<guide>.pdf`; `GUIDE=<guide>` rebuilds only that one (see [`guide-format.md`](guide-format.md)) |
| `make clean` | Remove `build/` intermediates (keeps the committed PDF) |
| `make merged` | After a PR merges: switch to `main`, pull, delete the branch (see [Git workflow](#git-workflow)) |
| `make help` | List targets |

### Conventions

- **Recipes are one-line aliases.** As soon as a target needs logic (a
  guard, a condition, `||`, `test`), the logic moves into a bash script in
  `scripts/` and the target calls it. The Makefile stays readable at a glance.
- **Names mirror the underlying tool** (`ci`, `install`, `dev-install`,
  `uninstall`), so nothing needs translating.
- **Hooks call the scripts, not `make`.** `make` is the interface for
  people, agents and CI. `lefthook.yml` calls the scripts behind the
  targets directly, so it can pass staged file lists as separate
  arguments; through a make variable, paths with spaces would break.
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
   GitHub deletes the remote branch automatically.
5. Clean up with `make merged` (from the Claude console: `!make merged`).
   It checks the PR is merged, switches to `main`, fast-forwards it and
   deletes the local branch. Already on `main`? `make merged BRANCH=<name>`.
6. `main` is protected: no direct pushes, and CI must pass before merging.

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
| L1: format & lint | Prettier (Astro + Tailwind plugins), ESLint (`eslint-plugin-astro`) | Pre-commit with auto-fix; CI in check mode | available (Prettier skips Markdown, see `.prettierignore`) |
| L2: types | `astro check` (strict TS; TypeScript 6.x per [ADR 0011](decisions/0011-pin-typescript-6.md)) | Pre-commit + CI | available |
| L3: project checks | Scripts in `tools/` | Pre-commit + CI | Added only when a rule earns one |
| L4: tests | Vitest (unit, Astro Container API) and Playwright with axe (end to end, WCAG 2.2 AA) ([ADR 0013](decisions/0013-test-layers.md)) | Unit: pre-commit + CI. End to end: CI only (needs a build and a browser) | available |
| CI gates | format, lint, types, unit tests, build, links, Lighthouse, end-to-end tests, PDF freshness (see [CI](#ci)) | Every PR | available |
| PDF freshness | `scripts/precommit-build-pdf.sh` | Pre-commit | available |
| Agent commands | `.claude/settings.json` denies direct `npm`/`npx`/`pnpm`/`yarn` and `node_modules/.bin/*` calls, so agents go through `make`, plus `git reset --hard` and `git clean -f`, which destroy uncommitted work; a guard rail, not a security boundary | Every agent session | available |

Hooks are defined in `lefthook.yml` and installed automatically when the
project's dependencies are installed (`make ci`). That relies on
`allowScripts` in `package.json`: the npm that ships with Node 24 runs a
package's install script only if it is listed there with `true`, and
warns about any it doesn't list. Lefthook's script installs the hooks,
and hyperlink's downloads its link-checker binary. `fsevents` is `false`
because it ships prebuilt and its script would only recompile it. When a
check fails, its message says
what rule broke, where, why, and how to fix it. Fix the cause; never
`--no-verify` around it.

If a commit fails with "failed to save unstaged changes", a file has both
staged and unstaged edits (a Lefthook bug with `git diff --output`). Stage
the whole file (`git add <file>`), or set the unstaged edits aside, then
commit again.

### The PDF hook

For each guide with files staged under `src/content/<guide>/`, and only
those, the hook:

| Situation | Action |
|---|---|
| PDF not staged | Rebuilds and stages `public/<guide>.pdf` |
| PDF staged and newer than every staged source file of that guide | Skips; you already built it |
| PDF staged but older than a staged source file of that guide | Rebuilds and stages it |

A build failure blocks the commit, naming the guide and the failing chapter;
the full log is in `build/<guide>/build-pdf.log`. A change to the pipeline
itself (`scripts/build-pdf.sh`, `scripts/pdf/`) does **not** trigger the
hook; run `make pdf` yourself and commit the PDFs.

`make pdf-check` (the CI `pdf` job) is the backstop: for every guide, it
fails if a commit touching `src/content/<guide>/` comes after the last
commit that changed `public/<guide>.pdf`.

---

## CI

`.github/workflows/ci.yml` runs on every PR to `main`
([ADR 0010](decisions/0010-ci-checks-and-gates.md),
[ADR 0013](decisions/0013-test-layers.md)). Every step is a `make`
target, so any failure can be reproduced locally with the same command.

| Job | Steps | Notes |
|---|---|---|
| `site` | `make ci` → `make format-check` → `make lint` → `make typecheck` → `make test-unit` → `make build` → `make linkcheck` → `make lighthouse` → `make browsers` → `make test-e2e` | Lighthouse reports are uploaded as the `lighthouse-reports` artifact, even on failure; the Playwright report as `playwright-report` when the job fails. Browsers are installed on every run, with no cache |
| `pdf` | `make pdf-check` | Checks out full history (`fetch-depth: 0`) to compare commit order |

**Link check:** internal links and anchors only, in `dist/` (hyperlink) and
in `README.md`, `CLAUDE.md`, `docs/` and `research/` (remark-validate-links,
configured in `.remarkrc.mjs`). The guide source is excluded because it's
print-only.

**Lighthouse thresholds** (`lighthouserc.json`): mobile, median of 3 runs.
Accessibility, best practices and SEO must score at least 0.95, and
performance at least 0.90. A failing page is listed with its category; the
HTML reports are in `.lighthouseci/` locally, or in the artifact on CI.

**End-to-end tests:** run `make browsers` once locally (and again after
Playwright is upgraded), then `make build && make test-e2e`. Locally,
Playwright reuses a preview server already running on port 4321. The axe
check fails on any WCAG 2.2 AA violation and lists each rule id, node and
help URL.
