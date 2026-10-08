# Tech stack

What we use, and why in one line. The full reasoning is in the linked ADRs.

| Area | Choice | Why |
|---|---|---|
| Framework | **Astro** (strict TypeScript) | Static by default, file-based routing, islands ship JS only where needed |
| Styling | **Tailwind CSS 4** (Vite plugin) | Utility classes; theme tokens defined once in CSS |
| Animation | **Motion**, vanilla API | Scroll-triggered and entrance animations with no framework runtime ([ADR 0003](decisions/0003-vanilla-motion-no-react.md)) |
| Data-driven graphics | **D3.js** | Landing node graph and data diagrams |
| Diagrams | **Mermaid** | Used in the PDF guides; web rendering put off ([ADR 0006](decisions/0006-defer-web-mermaid.md)) |
| Fonts | **Inter** + **Geist Mono**, via `@fontsource` | Self-hosted, with no third-party font requests ([ADR 0009](decisions/0009-visual-language.md)) |
| PDF guides | **pandoc + xelatex + mmdc** | Already used to build the guide; runs locally only ([ADR 0002](decisions/0002-commit-pdf-rebuild-in-hook.md)) |
| Command interface | **make** | One set of commands, identical locally and in CI ([ADR 0005](decisions/0005-make-command-interface.md)) |
| Git hooks | **Lefthook** | One config file listing every pre-commit check, installed through npm ([ADR 0001](decisions/0001-lefthook-for-git-hooks.md)) |
| CI | **GitHub Actions** | Runs on every PR (see [`development.md`](development.md#ci)) |
| CI checks | **hyperlink**, **remark-validate-links**, **Lighthouse CI** | Internal links and anchors in the built site and the docs; performance, accessibility and SEO gates. All npm devDependencies ([ADR 0010](decisions/0010-ci-checks-and-gates.md)) |
| Hosting | **Cloudflare Pages** | Builds on merge to `main`, preview deploys per PR |
| DNS | `ai.sandino.ca` CNAME → Cloudflare Pages | `sandino.ca` is managed at EasyDNS. Never change its nameservers. |

## Dependency policy

- Dependencies are added and removed through `make` targets, never by
  calling npm directly ([ADR 0005](decisions/0005-make-command-interface.md)).
- Before adding a library, check whether the platform or an existing
  dependency already covers it. Comparisons of competing libraries go to the
  researcher sub-agent.
- Adding React or another UI framework needs an ADR that supersedes
  ADR 0003.
