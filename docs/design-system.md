# Design system

The shell every page shares: colour, type, components and motion. This doc is
the **source of truth**. [`design/style-sample.html`](design/style-sample.html)
is a frozen mood board showing these choices in a browser; if the two
disagree, this doc wins. Rationale: [ADR 0009](decisions/0009-visual-language.md).

---

## Principles

Minimalist in spirit, visually rich. Visuals **teach, not decorate**. Every
animation should help a concept land. The same shell on every page; each
topic page sets its own content density inside it. Mobile-first.

## Themes

Dark and light. **Every visitor starts in dark**, whatever their system
setting. A sun/moon icon button in the header switches theme, and the
choice is remembered in `localStorage`. The design is dark-first. The
accent differs by theme: **emerald on dark, amber on light**. The favicon
follows the site's theme (see Brand marks). Rationale:
[ADR 0015](decisions/0015-dark-default-theme-toggle.md).

## Colour tokens

| Token | Dark | Light | Use |
|---|---|---|---|
| `bg` | `#13131a` | `#fafafa` | Page background |
| `bg-alt` | `#1b1b24` | `#f1f1f4` | Alternating section bands |
| `surface` | `#20202b` | `#ffffff` | Cards, code blocks, accordions |
| `border` | `#2c2c38` | `#e2e2e7` | Default borders, dividers |
| `border-strong` | `#38383d` | `#cfcfd6` | Hero card, ghost buttons |
| `text` | `#f5f5f7` | `#13131a` | Primary text |
| `text-2` | `#9a9aa5` | `#5c5c68` | Secondary text, body copy in cards |
| `text-3` | `#6b6b78` | `#8a8a96` | Tertiary labels, coming-soon nodes |
| `accent` | `#10b981` | `#f59e0b` | Button fills, live nodes, focus rings |
| `accent-strong` | `#10b981` | `#d97706` | Large accents: title highlight, line art, icons |
| `accent-text` | `#10b981` | `#b45309` | Small accent text: labels, nav, links |
| `accent-ink` | `#0a0b10` | `#13131a` | Text on accent fills |
| `accent-tint` | `rgba(16,185,129,.12)` | `rgba(245,158,11,.10)` | Badge and highlight backgrounds |
| `accent-line` | `rgba(16,185,129,.45)` | `rgba(217,119,6,.40)` | Badge borders, beams |
| `grid-line` | `rgba(245,245,247,.045)` | `rgba(19,19,26,.06)` | Hero background grid |
| `violet` | `#6e63ff` | `#5b4fe5` | Secondary accent: quote bars, FAQ label |
| `coral` | `#f65b66` | `#e5484d` | Secondary accent: urgent or attention labels |

Light mode uses three amber shades because amber is light. `amber-500` fills
carry near-black text; `amber-600` is used only for large elements; small
text uses `amber-700` to stay readable on white.

### Diagram colours: the four harness primitives

| Primitive | Dark | Light |
|---|---|---|
| Context | `#38bdf8` (sky) | `#0284c7` |
| Constraints | `#8b80ff` (violet) | `#5b4fe5` |
| Capabilities | `#10b981` (emerald) | `#059669` |
| Feedback loops | `#f65b66` (coral) | `#e5484d` |

Use these consistently in every diagram that shows the primitives. They are
separate from the UI accent so diagrams never compete with links and buttons.

## Typography

| Role | Font | Style |
|---|---|---|
| Headings | Inter (variable) | 700, letter-spacing `-0.035em`, line-height 1.05 |
| Body | Inter (variable) | 400, line-height 1.6 |
| Labels, nav, buttons, badges, code | Geist Mono (variable) | Uppercase, 11–12px, letter-spacing `.08–.12em` |

Both fonts are self-hosted through `@fontsource-variable/inter` and
`@fontsource-variable/geist-mono`.

Sizes: hero title `clamp(48px, 8vw, 84px)`; section title
`clamp(32px, 4.5vw, 44px)`; lead text 18px; body 16–17px; labels 12px.

**Landing hero title:** "Practical AI **engineering**" (accent on
"engineering"). The site name appears only small, in the nav.

## Components

- **Spec-sheet card:** a bordered card (1px `border-strong`, radius 8px)
  split into cells by 1px dividers, with an optional line-art column. Used
  for hero blocks.
- **Badge:** mono uppercase label, `accent-tint` background, `accent-line`
  border, radius 4px.
- **Buttons:** radius 4px, mono uppercase. *Primary* is an `accent` fill with
  `accent-ink` text; *ghost* is transparent with a `border-strong` outline.
- **Section label:** mono uppercase `accent-text` text above every section
  title.
- **Stats row:** big numbers (700, -0.035em) over mono labels, separated by
  vertical dividers.
- **Cards:** `surface` background, 1px `border`, radius 8px. A highlighted
  variant uses an accent-mixed background with an `accent-line` border.
- **Quote:** 3px `violet` left bar.
- **Accordion:** `surface` rows, with an accent `+` that rotates to `×`.
- **Section bands:** alternate `bg` and `bg-alt`.
- **Background grid:** 30px grid in `grid-line`, radial mask fading to the
  edges. On the landing page it runs behind the whole page, with the falling
  beams; on other pages, behind the hero only.
- **Feathered panel:** a borderless `bg` panel (radius 12px) whose edge
  feathers into the grid over ~40px (`box-shadow: 0 0 40px 28px var(--bg)`),
  so the grid dissolves around content rather than ending at a box. Used
  behind the landing graph so beams never cross it.
- **Topic graph:** see `docs/briefs/landing.md`; references in
  `docs/design/graph-layouts.html` (panel A) and `docs/design/graph-edges.html`.
- **Pixel field:** twinkling accent squares at the foot of the page.

## Brand marks

The brand is typographic: there is no logo. Every mark is built from the
tokens, fonts and motifs above, and the image assets are committed in
`public/`.

- **Wordmark:** `ai.sandino.ca` in Geist Mono, 13px, lowercase, with `ai` in
  `accent-text` and `.sandino.ca` in `text`. Used in the header only
  (it links home).
- **Favicon:** a single accent square (9 of 16 units, radius 2) centred on
  a `bg` tile (radius 3), echoing the pixel field.
  - `public/favicon-dark.svg` (emerald on `bg`) and
    `public/favicon-light.svg` (`accent-strong`, amber-600, on `bg`, since
    amber-500 is too faint at 16px on white). The page links the one that
    matches its theme, and the toggle swaps it.
  - `public/apple-touch-icon.png`: 180px, dark, full-bleed (iOS adds its own
    rounded corners).
- **Social card:** `public/og.png`, 1200×630 PNG, under 300 KB, dark theme
  only (link previews ignore the visitor's theme).
  - Background `bg` with the 30px hero grid in `grid-line`, radially masked.
  - Inset 80px. Top left: the wordmark at 28px.
  - Bottom left: "Practical AI **engineering**", Inter 700, 96px,
    letter-spacing `-0.035em`, line-height 1.05, `text` with "engineering"
    in `accent-strong`.
  - Bottom right: a static cluster of six accent squares (a frozen pixel
    field).
  - Alt text: "Practical AI engineering — ai.sandino.ca".
  - A changed image gets a new filename: platforms cache previews by URL.
- **Topic cards (later):** the same frame, with the page title in place of
  the hero title and a mono label such as `TOPIC 03 / FEEDBACK LOOPS` above
  it. Not built until topic pages exist.

## Motion

All motion uses vanilla Motion, except the topic graph's, which uses D3 (it
animates SVG driven by the layout). **Everything respects
`prefers-reduced-motion`:** when it is set, elements appear in their final
state with no movement.

| Effect | Settings | Use |
|---|---|---|
| Fade up | opacity 0→1, y 26→0px, spring (bounce 0, 1.2s), staggered delays 0.1–0.2s | Default entrance for blocks |
| Blur in | opacity 0→1, blur 10→0px, y 12→0 | Headings |
| Fly in | y 214→0, rotate ±6–8°→0, spring, 0.1s stagger | Card groups |
| Line draw | stroke-dashoffset length→0, 1.4s ease-in-out, staggered | Line art, diagram edges |
| Count up | 0→value, 1.6s ease-out | Numeric stats |
| Word highlight | words go from 0.28 to 1 opacity as you scroll | One key statement per page at most |
| Falling beams | 1px accent gradient lines, 7–9s linear loop | Behind the whole landing page; elsewhere, hero background only |
| Grid fade | opacity 0→1, 1.5s | Background grid on load |
| Graph glide | layout computed off-screen; each node eases out (cubic) from the centre to its place over 1.6s, 260ms stagger, while fading, growing (0.3→1) and sharpening (blur 8→0px) | Topic graph entrance |
| Graph breathing | tiny sinusoidal drift per node (≤ ~2px), heavily damped | Topic graph at rest (loop) |
| Hub spark | jagged accent arc sweeping ~half a lap round the hub in 0.7s, every 2.5–5s, after the entrance | Topic graph hub (loop) |
| Sticky header | backdrop blur 10px with a gradient mask | Always |

Entrances trigger once, when an element scrolls into view. Nothing loops
except the falling beams, the pixel field, and the topic graph's breathing
and hub spark.
