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

Dark and light, **following the visitor's system setting**
(`prefers-color-scheme`). There is no toggle. The design is dark-first.
The accent differs by theme: **emerald on dark, amber on light**.

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
- **Hero background grid:** 30px grid in `grid-line`, radial mask fading to
  the edges.
- **Pixel field:** twinkling accent squares at the foot of the page.

## Motion

All motion uses vanilla Motion. **Everything respects
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
| Falling beams | 1px accent gradient lines, 7–9s linear loop | Hero background only |
| Grid fade | opacity 0→1, 1.5s | Hero grid on load |
| Sticky header | backdrop blur 10px with a gradient mask | Always |

Entrances trigger once, when an element scrolls into view. Nothing loops
except the hero beams and the pixel field.
