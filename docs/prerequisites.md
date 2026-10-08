# Prerequisites

Tools to install locally. Nothing in this repo installs system tools for you;
scripts report what is missing and stop.

## Everyone

| Tool | Version | Install (macOS) |
|---|---|---|
| Node.js | 24.x (pinned in `.nvmrc`; CI uses the same file) | `nvm install && nvm use` (reads `.nvmrc`), or [nodejs.org](https://nodejs.org) |
| make | any | Ships with Xcode Command Line Tools: `xcode-select --install` |
| Google Chrome | current | Needed by `make lighthouse`; set `CHROME_PATH` if it's installed somewhere unusual |

Then run `make ci` to install the project's dependencies and git hooks.

## PDF guides only

Needed to rebuild a companion PDF (`make pdf`, or the pre-commit hook when
guide source changes). If you only work on the site, you can skip these.

| Tool | Used for | Install (macOS) |
|---|---|---|
| pandoc | Markdown → LaTeX → PDF | `brew install pandoc` |
| xelatex (MacTeX) | Typesetting engine | `brew install --cask mactex-no-gui`, then restart the shell so `/Library/TeX/texbin` is on `PATH` |
| mmdc (Mermaid CLI) | Pre-rendering Mermaid diagrams | `npm install -g @mermaid-js/mermaid-cli` (it bundles headless Chromium; set `PUPPETEER_EXECUTABLE_PATH` if Chromium fails to launch) |

Check everything is on `PATH`:

```bash
pandoc --version && xelatex --version && mmdc --version
```
