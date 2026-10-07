# 0001 — PR description templates and Conventional Commit PR titles

**Date:** 2026-10-07
**Status:** Current
**Question:** What is a good standard PR description template, and how
should PR titles follow Conventional Commits?

---

**Bottom line:** Use a short Summary (why-first) + Test plan template, add conditional sections only when relevant, and title PRs as Conventional Commits.

**Recommendation:** Summary (required, why first) and Test plan (required, checks actually run); conditional Related, Screenshots (UI only), Breaking changes (only with `!`). Delete unused sections; no checklists; don't restate the diff. Title: `type(scope)!: imperative lowercase summary`, under ~70 chars, no trailing period. With rebase merge the PR title doesn't land on `main` (the commits do), so no title linter is needed; `amannn/action-semantic-pull-request` targets squash merging. Adopted with one addition, **Follow-ups**, in the global `/pr` skill (`~/.claude/skills/pr/SKILL.md`).

**Key findings:**
- GitHub supports one template per repo at `.github/pull_request_template.md` (or root / `docs/`); account-wide defaults need a `.github` repo. (source: https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/creating-a-pull-request-template-for-your-repository, confidence: high)
- Google eng-practices: a standalone imperative first line, then context, problem and rationale; say what AND why; "Fix bug" is a bad description. (source: https://google.github.io/eng-practices/review/developer/cl-descriptions.html, confidence: high)
- Conventional Commits: `<type>[scope]: <description>`; only feat/fix are mandated; breaking via `!` or a `BREAKING CHANGE:` footer. (source: https://www.conventionalcommits.org/en/v1.0.0/, confidence: high)
- action-semantic-pull-request validates PR titles and recommends squash merge so the title becomes the commit. (source: https://github.com/amannn/action-semantic-pull-request, confidence: high)
- Summary + Test plan is the common agent-written PR convention. (source: prior knowledge, not re-verified, confidence: medium)
- Large OSS templates are heavier (checklists, CLA) because they serve many external contributors; that doesn't apply to a solo developer. (confidence: low-medium)

**Caveats:** The CC spec doesn't define PR title rules; that's convention driven by squash merging. Test-plan checkboxes are meaningful only if ticked honestly. Large OSS templates and the gh CLI defaults weren't fetched directly.
