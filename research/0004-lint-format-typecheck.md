# 0004 — Formatting, linting and type checking for Astro 7 + Tailwind v4

**Date:** 2026-10-11
**Status:** Current
**Question:** How should Prettier, ESLint and `astro check` be set up for an
Astro 7 + Tailwind v4 site, run from Lefthook pre-commit with auto-fix, and
how can `.claude/settings.json` block direct `npm`/`npx` calls?

---

**Bottom line:** Use Prettier 3.9 with `prettier-plugin-astro`, and load `prettier-plugin-tailwindcss` last with `tailwindStylesheet` set. Use an ESLint 10 flat config with `eslint-plugin-astro` and `typescript-eslint`. Run `astro check` through `@astrojs/check`. **Pin `typescript` to `^6`:** npm's latest is 7.x, which `@astrojs/check` does not support.

## 1. Prettier + Astro + Tailwind v4

- Versions (npm dist-tags, 2026-10-11): `prettier` 3.9.10 (4.0 is alpha only), `prettier-plugin-astro` 1.1.1, `prettier-plugin-tailwindcss` 0.8.1.
- Load `prettier-plugin-astro` first and `prettier-plugin-tailwindcss` last. No merge plugin is needed.
- In Tailwind v4, `tailwindStylesheet` is **required**: "When using Tailwind CSS v4 you must specify your CSS file entry point". In this repo that file is `src/styles/global.css`.

```js
// prettier.config.mjs
export default {
  plugins: ['prettier-plugin-astro', 'prettier-plugin-tailwindcss'],
  overrides: [{ files: '*.astro', options: { parser: 'astro' } }],
  tailwindStylesheet: './src/styles/global.css',
};
```

`.prettierignore` candidates: `dist`, `.astro`, `node_modules`, `package-lock.json`, `.lighthouseci`, `public/**/*.pdf`, `src/content/harness-guide` (authored content, not code).

## 2. ESLint flat config

- Versions: `eslint` 10.12.0 (9.x is in maintenance at 9.39.5), `eslint-plugin-astro` 3.1.0, `typescript-eslint` 8.71.1.
- `eslint-plugin-astro` 3.1.0 requires ESLint >=10 and Node >=24.16.0 on the 24 line.
- Install: `eslint @eslint/js typescript-eslint eslint-plugin-astro globals`. The parsers (`@typescript-eslint/parser`, `astro-eslint-parser`) come in as dependencies.
- `eslint-config-prettier` is not needed while the config has no stylistic rules.

```js
// eslint.config.mjs
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist', '.astro', '.lighthouseci', 'src/content/harness-guide']),
  js.configs.recommended,
  tseslint.configs.recommended,
  astro.configs.recommended,
]);
```

## 3. `astro check`

- Install `@astrojs/check` (0.9.10) and `typescript@^6`.
- `typescript` 7.0.2 (the native port) is npm's latest. `@astrojs/check` peers `^5 || ^6`, and upstream withastro/astro#17268 is "unable to fix". Dependency bots must keep `typescript` below 7.
- tsconfig: extend `astro/tsconfigs/strict` (this repo already does). `strictest` is optional.
- Exit code:
  - It exits 1 on errors only by default.
  - `--minimumFailingSeverity warning|hint` makes it stricter.
  - `--minimumSeverity` controls what is displayed.
- It runs `astro sync` first.
- It always checks the whole project and takes no file arguments, so run it once per commit, not per staged file.
- Runtime: probably a few seconds to tens of seconds on a small site. This is an estimate.

## 4. Lefthook v2 pre-commit

- Use `{staged_files}`, `glob` and `stage_fixed: true`.
- `jobs:` (introduced in v1.10) and `commands:` both work in v2.
- `stage_fixed` works only in `pre-commit`. It honours `glob` and `exclude`, and fails the hook if `git add` fails.
- Keep format → lint → types **sequential**: Prettier and ESLint rewrite the same files, and the type check needs the final contents.

```yaml
pre-commit:
  jobs:
    - name: format
      run: <prettier --write wrapper> {staged_files}
      glob: "*.{astro,ts,js,mjs,css,json,md,yml}"
      stage_fixed: true
    - name: lint
      run: <eslint --fix wrapper> {staged_files}
      glob: "*.{astro,ts,js,mjs}"
      stage_fixed: true
    - name: types
      run: <astro check wrapper>
```

## 5. Claude Code permissions

- `Bash(npm *)` and the legacy `Bash(npm:*)` are equivalent, and both also match the bare command.
- Precedence is deny → ask → allow, first match wins. An allow cannot carve an exception out of a deny.
- Deny matches any subcommand of a compound command (`&&`, `||`, `;`, `|`, `&`, newlines), including inside subshells and command substitutions.
- Deny also matches past leading env assignments and wrappers like `timeout`, `nice` and `command`.

```json
{
  "permissions": {
    "allow": ["Bash(make *)"],
    "deny": ["Bash(npm *)", "Bash(npx *)", "Bash(pnpm *)", "Bash(yarn *)"]
  }
}
```

## Gotchas

- The deny rule is a guard rail, not a security boundary. It misses `/usr/bin/npm`, `sh -c 'npm …'` and `env npm`. Makefile recipes still call npm, which is intended.
- With partial staging, `stage_fixed` re-adds the **whole** file, so unstaged hunks get swept into the commit. This is unverified; test it in a scratch worktree, or avoid partial staging.

## Sources

- https://github.com/tailwindlabs/prettier-plugin-tailwindcss
- https://github.com/withastro/prettier-plugin-astro
- https://unpkg.com/eslint-plugin-astro@3.1.0/README.md
- https://docs.astro.build/en/reference/cli-reference/
- https://docs.astro.build/en/guides/typescript/
- withastro/astro#17268 (TS 7 incompatibility)
- https://lefthook.dev/configuration/stage_fixed
- https://lefthook.dev/configuration/jobs
- https://code.claude.com/docs/en/permissions
- npm dist-tags for each package, fetched 2026-10-11

## Open uncertainties

- The exact `@astrojs/check` 0.9.10 peer range, and whether Astro 7.3.5 accepts TS 6. The install will confirm both.
- Whether `defineConfig` accepts `astro.configs.recommended` without spreading it.
- No v2 Lefthook changelog review.
- The `astro check` runtime is an estimate.
