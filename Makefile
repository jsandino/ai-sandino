.PHONY: help ci install dev-install uninstall dev build format format-check lint lint-fix linkcheck lighthouse pdf-check pdf clean merged

help: ## List all targets
	@bash scripts/make-help.sh Makefile

# --- Dependencies ---------------------------------------------------------

ci: ## Install dependencies exactly as locked (same as CI)
	npm ci

install: ## Add a runtime dependency: make install PKG=<name>
	@bash scripts/deps.sh install $(PKG)

dev-install: ## Add a dev dependency: make dev-install PKG=<name>
	@bash scripts/deps.sh dev-install $(PKG)

uninstall: ## Remove a dependency: make uninstall PKG=<name>
	@bash scripts/deps.sh uninstall $(PKG)

# --- Site -----------------------------------------------------------------

dev: ## Start the local dev server
	npm run dev

build: ## Build the production site into dist/
	npm run build

# --- Checks (CI runs these on every PR) ------------------------------------

format: ## Format code and config with Prettier (rewrites files)
	@bash scripts/format.sh write

format-check: ## Fail if any file is not formatted (CI)
	@bash scripts/format.sh check

lint: ## Fail on any ESLint error or warning (CI)
	@bash scripts/lint.sh check

lint-fix: ## Apply ESLint's automatic fixes (rewrites files)
	@bash scripts/lint.sh fix

linkcheck: ## Check internal links and anchors in dist/ and the repo's Markdown
	@bash scripts/linkcheck.sh

lighthouse: ## Audit dist/ with Lighthouse CI against the score thresholds
	@bash scripts/lighthouse.sh

pdf-check: ## Fail if guide source changed after the PDF was last rebuilt
	@bash scripts/check-pdf-fresh.sh

# --- PDF guide --------------------------------------------------------------

pdf: ## Rebuild public/harness-guide.pdf (Mermaid pre-render, then pandoc)
	bash scripts/render-diagrams.sh
	bash scripts/build-pdf.sh

clean: ## Remove build/ intermediates (keeps the committed PDF)
	rm -rf build

# --- Git --------------------------------------------------------------------

merged: ## After a PR merges: switch to main, pull, delete the branch [BRANCH=<name>]
	@bash scripts/merged.sh $(BRANCH)
