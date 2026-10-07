# Prerequisites

Tools to install locally. Nothing in this repo installs system tools for you;
scripts report what is missing and stop.

## Everyone

| Tool | Version | Install (macOS) |
|---|---|---|
| Node.js | ≥ 22.12.0 (from `package.json` `engines`) | `nvm install 22` or [nodejs.org](https://nodejs.org) |
| make | any | Ships with Xcode Command Line Tools: `xcode-select --install` |

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
