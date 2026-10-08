.PHONY: help ci install dev-install uninstall dev build linkcheck lighthouse pdf-check pdf clean

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
