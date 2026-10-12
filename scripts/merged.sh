#!/usr/bin/env bash
#
# merged.sh — clean up after a PR is merged. Called by `make merged`.
#
#   1. Checks the branch's PR is MERGED on GitHub (gh), so unmerged work is
#      never deleted.
#   2. Switches to main and fast-forwards it, pruning gone remote branches.
#   3. Deletes the remote branch if GitHub hasn't already (it normally has:
#      "Automatically delete head branches" is on).
#   4. Deletes the local branch.
#
# Uses the current branch, or BRANCH=<name> when already on main.
# The local branch is force-deleted (-D): PRs are rebase-merged, so its
# commits never appear in main by SHA and `git branch -d` would refuse.
# Step 1 is what makes that safe.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

BRANCH="${1:-$(git branch --show-current)}"

if [[ -z "$BRANCH" || "$BRANCH" == "main" ]]; then
  cat >&2 <<'MSG'
MERGED: NO FEATURE BRANCH
  Rule: run it from the merged feature branch, or name the branch.
  Fix:  make merged BRANCH=<branch>
MSG
  exit 1
fi

if ! git diff --quiet || ! git diff --cached --quiet; then
  cat >&2 <<'MSG'
MERGED: UNCOMMITTED CHANGES
  Rule: the working tree must be clean before switching to main, so no
        work is carried across or lost.
  Fix:  commit or stash your changes, then re-run: make merged
MSG
  exit 1
fi

if ! command -v gh >/dev/null; then
  cat >&2 <<'MSG'
MERGED: gh NOT FOUND
  Rule: the PR's merge state is checked on GitHub before anything is deleted.
  Fix:  brew install gh && gh auth login (see docs/prerequisites.md)
MSG
  exit 1
fi

state="$(gh pr view "$BRANCH" --json state --jq .state 2>/dev/null || echo NONE)"
if [[ "$state" != "MERGED" ]]; then
  cat >&2 <<MSG
MERGED: PR FOR '$BRANCH' IS NOT MERGED (state: $state)
  Rule: a branch is only deleted once its PR is merged on GitHub.
  Fix:  merge the PR first, or check the branch name.
MSG
  exit 1
fi

git switch main
git pull --ff-only --prune

if git ls-remote --exit-code --heads origin "$BRANCH" >/dev/null; then
  git push origin --delete "$BRANCH"
fi

if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  git branch -D "$BRANCH"
fi

echo "Done: '$BRANCH' cleaned up; main is up to date."
