# Appendix A — Reference toolchain (Python)

This appendix collects the minimal viable configurations for each tool in the harness engineering stack. These are starting points — copy them into a new project and adjust as the project's needs become clear. Every setting included here earns its place; nothing is included for completeness alone.

All configurations assume Python 3.11+. For earlier versions, adjust `target-version` and `pythonVersion` accordingly.

---

## A.1 Project layout assumptions

The configurations below assume this layout:

```
project-root/
├── src/                  # application source code
├── tests/                # unit tests
│   └── integration/      # slow tests that load models or hit external services
├── tools/                # custom check scripts (Layer 3)
├── docs/                 # project knowledge base
│   ├── README.md
│   ├── architecture.md
│   ├── tech-stack.md
│   └── decisions/
├── .claude/
│   └── skills/           # agent skill files
├── .env                  # real secrets — gitignored
├── .env.example          # variable names with placeholders — committed
├── .pre-commit-config.yaml
├── pyproject.toml
├── CLAUDE.md
└── README.md
```

Adjust paths in the configurations below to match your actual layout.

---

## A.2 Ruff (lint + format)

Ruff replaces Black, flake8, isort, and pyupgrade in a single dependency. Add to `pyproject.toml`:

```toml
[tool.ruff]
target-version = "py311"
line-length = 88

[tool.ruff.lint]
select = [
    "E",    # pycodestyle errors
    "F",    # pyflakes (undefined names, unused imports)
    "I",    # isort (import ordering)
    "UP",   # pyupgrade (modernise syntax for target Python version)
    "B",    # flake8-bugbear (likely bugs and design issues)
    "SIM",  # flake8-simplify (unnecessary complexity)
]
ignore = [
    "E501", # line too long — handled by the formatter, not the linter
]

[tool.ruff.lint.per-file-ignores]
"tests/*" = ["S101"]  # allow assert in tests

[tool.ruff.format]
quote-style = "double"
indent-style = "space"
skip-magic-trailing-comma = false
```

**Common commands:**

```bash
ruff check .              # report lint violations
ruff check . --fix        # auto-fix what's fixable
ruff format .             # reformat files
ruff format . --check     # report what would be reformatted (CI mode)
```

**Agent sessions:** use `--fix` and `ruff format` by default so the agent never has to manually resolve style violations. Reserve `--check` for CI.

---

## A.3 Pyright (type checking)

Add to `pyproject.toml`:

```toml
[tool.pyright]
pythonVersion = "3.11"
typeCheckingMode = "basic"
include = ["src"]
exclude = [
    "tests",
    "migrations",
    "**/__pycache__",
]
reportMissingImports = true
reportMissingTypeStubs = false   # suppress noise from untyped third-party libs
```

**Start with `basic` mode.** Strict mode is valuable but generates enough violations in a typical codebase that it becomes noise. Graduate to strict incrementally:

1. Start with `"basic"` — catches the most impactful type errors.
2. Once `basic` is clean, enable `"standard"` — adds more inference.
3. Once `standard` is clean, enable `"strict"` — requires explicit types everywhere.

**Installation:**

```bash
pip install pyright
```

Pyright runs as a `local` hook (see pre-commit config below) because it needs to see your project's actual installed dependencies. Keep it in your project's virtual environment, not managed by pre-commit's isolated environments.

---

## A.4 Pre-commit

`.pre-commit-config.yaml` at the repo root:

```yaml
repos:
  # Layer 1 — Ruff: lint and format
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.4.4   # pin to a specific version; update deliberately
    hooks:
      - id: ruff
        args: [--fix]       # auto-fix before commit
      - id: ruff-format

  # Layer 2 — Pyright: type checking
  - repo: local
    hooks:
      - id: pyright
        name: pyright
        entry: pyright
        language: system
        types: [python]
        pass_filenames: false   # pyright checks the whole project

  # Layer 3 — Custom project invariant checks
  # Add your own check scripts here. See Appendix B for templates.
  - repo: local
    hooks:
      - id: check-hardcoded-secrets
        name: Hardcoded secrets
        entry: python tools/check_hardcoded_secrets.py
        language: system
        pass_filenames: false

      - id: check-doc-links
        name: Documentation cross-links
        entry: python tools/check_doc_links.py
        language: system
        pass_filenames: false

  # Layer 4 — Fast unit tests only
  # Integration tests belong in CI, not in the commit hook.
  - repo: local
    hooks:
      - id: pytest-unit
        name: Unit tests
        entry: pytest tests/ --ignore=tests/integration -x -q
        language: system
        pass_filenames: false
```

**Setup (run once per repo clone):**

```bash
pip install pre-commit
pre-commit install
```

**Run manually on all files:**

```bash
pre-commit run --all-files
```

**Escape hatch (use sparingly):**

```bash
git commit --no-verify -m "wip: checkpoint"
```

**Keeping hook versions current:** update `rev` values deliberately, not automatically. A hook version update can introduce new violations that break the developer's flow if landed unexpectedly. Review the changelog before updating.

---

## A.5 pytest

Add to `pyproject.toml`:

```toml
[tool.pytest.ini_options]
pythonpath = ["."]
testpaths = ["tests"]
addopts = [
    "-ra",          # show summary of all non-passing tests
    "--tb=short",   # shorter traceback format
]
filterwarnings = [
    "ignore::DeprecationWarning",
]
```

**Test layout convention:**

```
tests/
├── conftest.py           # shared fixtures
├── test_users.py         # unit tests for users module
├── test_payments.py      # unit tests for payments module
└── integration/
    ├── conftest.py       # integration-specific fixtures
    └── test_api.py       # tests that hit the real database or network
```

**Common commands:**

```bash
pytest tests/ --ignore=tests/integration   # fast unit tests only
pytest tests/                              # all tests including integration
pytest tests/ -x                           # stop on first failure
pytest tests/ -k "test_user"               # run tests matching a pattern
pytest tests/ -v                           # verbose output
```

**For agent sessions:** run `pytest tests/ --ignore=tests/integration -x -q` by default. The `-x` flag stops on the first failure — this keeps the agent's feedback loop tight, addressing one failure at a time rather than producing a wall of failures that is harder to diagnose.

---

## A.6 Custom check script template

A minimal template for a Layer 3 custom check. Copy this into `tools/check_<name>.py` and fill in the invariant-specific logic:

```python
#!/usr/bin/env python3
"""
check_<name>.py

[One sentence describing what invariant this check enforces and why.]
"""

import sys
from pathlib import Path

# Patterns or values that are explicitly allowed (exceptions to the rule).
# Each entry should have a comment explaining why it is allowed.
ALLOWED_PATTERNS: list[str] = [
    # "example-allowed-value",   # reason it's allowed
]

VIOLATION_MESSAGE = """
[RULE NAME IN CAPS]
  File: {file}, line {line}
  Rule: [One to two sentences stating the invariant and why it exists.]
  Found: {detail}
  Fix:   [Concrete, actionable fix — specific enough that the agent can
          act without asking a follow-up question.]
         [If there are multiple fix paths, describe each one.]
         To allowlist a legitimate exception, add it to ALLOWED_PATTERNS
         in tools/check_{name}.py.
  Docs:  [path to the relevant doc, e.g. docs/security-constraints.md]
"""


def check_file(path: Path) -> list[str]:
    """Return a list of violation messages for the given file."""
    violations = []
    source = path.read_text()

    # --- Your check logic here ---
    # Prefer AST-based checks over text-based ones for anything nuanced.
    # Text-based checks (grep-style) produce more false positives.

    return violations


def main() -> int:
    src_dir = Path("src")
    if not src_dir.exists():
        return 0

    all_violations: list[str] = []
    for py_file in src_dir.rglob("*.py"):
        all_violations.extend(check_file(py_file))

    if all_violations:
        for v in all_violations:
            print(v, file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
```

**The four-question test for every violation message:** before shipping a check, verify that its violation message answers:

1. What rule was violated?
2. Where exactly (file and line)?
3. Why does this rule exist?
4. How do I fix it?

If any question is unanswered, the message is not done.

---

## A.7 .gitignore essentials

```gitignore
# Python
.venv/
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
*.egg-info/
dist/
build/

# Environment
.env          # real secrets — never commit
.envrc

# Tool caches
.ruff_cache/
.mypy_cache/
.pytest_cache/

# Editor
.vscode/settings.json
.idea/

# OS
.DS_Store
Thumbs.db
```

Note: `.env.example` is **not** in `.gitignore`. It is committed — it documents which environment variables the project requires, with placeholder values. `.env` contains real values and is gitignored.

---

## A.8 Installation order for a new project

When setting up a new project from scratch:

```bash
# 1. Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate    # macOS/Linux
# .venv\Scripts\activate     # Windows

# 2. Install project dependencies
pip install -r requirements.txt

# 3. Install development tools
pip install ruff pyright pre-commit pytest

# 4. Install the pre-commit hooks
pre-commit install

# 5. Run everything once to verify setup is clean
pre-commit run --all-files
pytest tests/ --ignore=tests/integration

# 6. If all checks pass, make the initial commit
git add .
git commit -m "chore: initial project setup with harness toolchain"
```

If `pre-commit run --all-files` fails on a fresh project, fix the violations before making the first commit. Starting with a clean check suite is significantly easier than inheriting a backlog of pre-existing violations.
