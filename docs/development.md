# Development

How to work on this project: commands, git workflow, and the checks that
guard each change. Tools to install first: [`prerequisites.md`](prerequisites.md).

---

## make

Every command (run, build, check and dependency changes) goes through `make`,
for humans and agents, locally and in CI. The command that passes on your
machine is the command CI runs ([ADR 0005](decisions/0005-make-command-interface.md)).

| Target | Runs |
|---|---|
| `make pdf` | Rebuild `public/harness-guide.pdf` |
| `make clean` | Remove `build/` intermediates (keeps the committed PDF) |

### Conventions

- **Recipes are one-line aliases.** As soon as a target needs logic (a
  guard, a condition, `||`, `test`), the logic moves into a bash script in
  `scripts/` and the target calls it. The Makefile stays readable at a glance.
- **Names mirror the underlying tool** (for example a target named `ci`
  for `npm ci`), so nothing needs translating.
- **Every target has a `## description` comment** saying what it does.
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

---

## Enforcement layers

Each layer catches a different class of mistake, as early as possible.

| Layer | Tool | Runs on | Status |
|---|---|---|---|
| L1: format & lint | Prettier (Astro + Tailwind plugins), ESLint (`eslint-plugin-astro`) | Pre-commit with auto-fix; CI in check mode | planned (tooling PR) |
| L2: types | `astro check` (strict TS) | Pre-commit + CI | planned (tooling PR) |
| L3: project checks | Scripts in `tools/` | Pre-commit + CI | Added only when a rule earns one |
| L4: tests | none yet; Vitest arrives with the D3 graph | none | The Astro build is the test for now |
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

Defined in kickoff step 5 (not yet written). It will run on every PR, through
`make` targets only, and include a backstop check that the committed PDF is
not stale.
