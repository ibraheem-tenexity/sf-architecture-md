# DESIGNER — Visual Design Guidance (Tenexity brand)

Source of truth: `skills/tenexity-design/` (`SKILL.md`, `PATTERN_MATRIX.md`,
`application-archetype.md`, `tokens.css`, `tailwind.config.ts`). Brand canon
**overrides** the general design skills on any conflict. The app already ships
`tokens.css` verbatim into `app/globals.css` and a matching `tailwind.config.ts`
— this doc references those exact token names so a builder implements without
guessing. **Never hard-code hex; always `hsl(var(--token))` or the Tailwind theme
key.** The deployed CSS must contain `--brand: 214 100% 55%` (gate check).

This is a developer tool: precise, calm, technical, trustworthy. Light-first.
That means restrained — hairline borders, generous whitespace, one accent
(Tenexity Blue), monospace for anything code-shaped. No gradients-on-white, no
decorative noise. Elegance from precision, not intensity.

---

## 1. Brand archetype & layout

### Archetype (from PATTERN_MATRIX.md)
- **Primary: Doc Generator** (`/archetypes/library/doc-generator`,
  `DocGeneratorArchetype.tsx`). This app's whole job is "input → async synthesis
  → structured generated document with per-section regenerate." That is the Doc
  Generator contract verbatim.
- **Secondary: Record Editor** (`RecordEditorArchetype.tsx`) for the Document
  view — a sticky section index on the left, an editable reading pane in the
  center, section-level controls. This is the **Wiki** route's grammar
  (`Catalog, Record Editor, Tree Table` in the matrix): left section-nav + center
  editing pane.
- **Lineage** (`LineageArchetype.tsx`) informs only the Mermaid container — a
  module/relationship graph rendered as a labelled, read-only artifact.

We deliberately do **not** use the full seven-zone workflow shell from
`application-archetype.md` (Dashboard/Worklist/Detail/Collab/Console/Insights/
Admin). This is a single-purpose generator, not an operator workflow app. We
borrow its **card grammar, page-header grammar, table conventions, and the
agent-at-work signature** (the brand "tell"), but the layout is generator +
document, not a sidebar-nav operator console.

### High-level layout — Home (`/`)
Centered hero, single column, max width ~`max-w-2xl` (672px), vertically
centered in the viewport. The existing `app/page.tsx` is already correct; keep it:
- **Category label** ("architecture.md") — `.category-label` utility (the tell).
- **Display heading** ("Generate a living ARCHITECTURE.md") — `font-display`
  (Georgia) at `text-display-lg`.
- Subhead in `text-body-lg text-secondary`.
- Input + primary button on one row; **Use sample repo** as a quiet text/link
  button beneath.
- Page background `bg-background` (#FAFAFA); the input sits on `bg-raised`
  (#FFFFFF) so the field reads as a raised surface against the page.
- Optional: a faint full-bleed brand wash behind the hero using
  `hsl(var(--brand)/0.04)` only — no purple, no mesh.

### High-level layout — Document view (`/doc/{id}`)
Two-column app frame inside a centered container (`container`, max 1400px):

```
┌───────────────────────────────────────────────────────────────┐
│ Doc header bar (sticky top): repo name · Stale badge ·         │
│   [Copy markdown] [Export]                                     │
├──────────────┬────────────────────────────────────────────────┤
│ Section nav  │  Reading / editing pane (max-w ~768px)          │
│ (sticky,     │   ┌──────────────────────────────────────────┐  │
│  240px rail) │   │ Overview      [Regenerate]  (section card)│  │
│              │   ├──────────────────────────────────────────┤  │
│  • Overview  │   │ Module map    [Regenerate]                │  │
│  • Module map│   │ Diagram       [Regenerate]                │  │
│  • Diagram   │   │ Codemap       [Regenerate]                │  │
│  • Codemap   │   └──────────────────────────────────────────┘  │
└──────────────┴────────────────────────────────────────────────┘
```

- Left **section nav** is a sticky rail (`position: sticky; top`), 240px, real
  `<a href="#overview">` anchors — tab-reachable, scroll-spy highlights the
  active section. This is the Record-Editor index pattern.
- Center **reading pane** caps at ~768px (`max-w-3xl`) for comfortable prose
  measure; each of the four sections is a **section card** (see §5).
- The header bar carries doc-level actions and the **Stale** badge.
- Mobile: nav collapses above the pane as a horizontal scrollable chip row /
  in-page jump links; pane goes full width.

---

## 2. Palette (exact tokens)

All from `tokens.css`. Light is primary; the corresponding `.dark` block already
exists and may be enabled later — every token below has a dark counterpart, so
build against the token, not the hex.

| Role | Token | Tailwind key | Light hex |
|---|---|---|---|
| Page background | `--background` | `bg-background` | #FAFAFA |
| Raised surface (cards, input, header) | `--raised` | `bg-raised` | #FFFFFF |
| Sunken surface (code wells, table zebra, skeleton base) | `--sunken` | `bg-sunken` | #F4F4F5 |
| Brand / primary (button, links, active nav, focus) | `--brand` / `--primary` | `bg-brand` / `text-brand` | #1A7BFF |
| Brand hover / pressed | `--brand-deep` | `bg-brand-deep` | #0958C9 |
| Brand halo (active nav bg, soft fills, ai-tint) | `--brand-soft` / `--accent` | `bg-brand-soft` / `bg-accent` | #E8F1FF |
| Text primary | `--text-primary` / `--foreground` | `text-foreground` | #18181B |
| Text secondary (subheads, body muted) | `--text-secondary` | `.text-secondary` | #52525B |
| Text tertiary (labels, placeholder, captions) | `--text-tertiary` | `.text-tertiary` | #8A8A92 |
| Hairline border | `--border-subtle` | `border-border-subtle` | #E7E7E9 |
| Stronger border (inputs, table grid) | `--border-default` / `--input` | `border-border-default` / `border-input` | #D4D4D8 |
| Focus ring | `--ring` (= brand) | `ring-ring` | #1A7BFF |

### Status tokens (use these — never ad-hoc green/red/amber)
| Meaning | Fill token | Soft bg token |
|---|---|---|
| Success / Ready | `--success` (#059669) | `--success-soft` |
| Stale / Partial / warning | `--warning` (#D97706) | `--warning-soft` |
| Error / Failed | `--danger` (#DC2626) | `--danger-soft` |
| Info / Generating | `--info` (= brand) | `--info-soft` |

### Viz / diagram colors (Mermaid + module-map accents)
Use the `--viz-*` ramp (Okabe-Ito rebased on brand) — `viz-1..viz-7` Tailwind keys.
This is the only palette permitted for the diagram so it stays on-brand and
colorblind-safe.

| Diagram element | Token | Tailwind | Notes |
|---|---|---|---|
| Primary nodes / entry module | `--viz-1` (#1A7BFF, brand blue) | `viz-1` | the hero color of the graph |
| Secondary module cluster | `--viz-3` (#2BAE9E bluish-green) | `viz-3` | |
| Tertiary / external deps | `--viz-2` (#FF7A00 orange) | `viz-2` | |
| Additional clusters (rotate) | `--viz-4`…`--viz-7` | `viz-4`…`7` | yellow, blue, vermillion, purple |
| Edges / arrows | `--border-default` (#D4D4D8) | — | quiet; nodes carry color |
| Node label text | `--text-primary` | — | AA on light node fills |
| Diagram canvas bg | `--raised` (#FFFFFF) | `bg-raised` | inside a `--sunken`/hairline frame |

**Module-map table accents:** color the module-name cell or a leading dot with the
**same `--viz-n`** the node uses in the diagram, so table rows and diagram nodes
read as the same entity (the Lineage cross-reference). Keep fills soft — use a
small colored dot/swatch, not full-row tint.

Mermaid `themeVariables` should be wired to tokens, e.g.:
`primaryColor: hsl(var(--brand-soft))`, `primaryBorderColor: hsl(var(--brand))`,
`primaryTextColor: hsl(var(--text-primary))`, `lineColor: hsl(var(--border-default))`,
`fontFamily: var(--font-mono)`.

---

## 3. Typography

Three families, already in tokens — do not introduce others:
- **UI / body:** `--font-sans` → **Hanken Grotesk** (`font-sans`). Everything
  chrome: nav, buttons, labels, table cells, prose body.
- **Display:** `--font-display` → **Georgia serif** (`font-display`, weight 700,
  `-0.015em`). Reserved for the Home hero heading and each section's H2 title —
  this serif/sans pairing is the Tenexity editorial signature (per
  application-archetype: "Georgia title, body in Hanken").
- **Mono:** `--font-mono` → JetBrains Mono / ui-monospace (`font-mono`). **All
  code-shaped content:** file paths, the codemap index, symbol names, the raw
  Mermaid source, copy-markdown preview, repo URL echo, SHAs. Add `.tabular`
  (`font-variant-numeric: tabular-nums`) for line counts / metrics.

### Type scale (Tailwind `fontSize` keys, all defined)
| Token | Size/LH | Use |
|---|---|---|
| `display-lg` | 44/50 | Home hero heading (`font-display`) |
| `display-md` | 32/38 | Document `<h1>` (repo name) option |
| `heading-lg` | 24/30 | Section H2 titles (`font-display`) |
| `heading-md` | 20/26 | Sub-section / table caption |
| `heading-sm` | 16/22 | Card header label, nav group |
| `body-lg` | 16/24 | Home subhead, overview prose |
| `body-md` | 14/20 | Default UI/body, table cells, buttons |
| `body-sm` | 13/18 | Secondary text, "Use sample repo", tooltips |
| `caption` | 12/16 | Badge text, helper text |
| `micro` | 11/1, +0.12em | `.category-label` (uppercase tell) |

### Weights
- 400 normal body; **500 (medium)** for buttons, nav labels, table headers,
  badges; **700** only via `.font-display` for serif titles. Avoid 600/800 — keep
  the system's two-step weight rhythm. Body line-height stays generous (prose at
  `body-lg`, 24px LH) for the reading pane.

---

## 4. Layout & spacing

- **Grid / frame:** Tailwind `container` (centered, 2rem padding, max **1400px**).
  Document view = 2-track grid: `grid-cols-[240px_minmax(0,1fr)]` with a `gap-8`
  (32px) gutter; collapses to single column under `lg`.
- **Section-nav rail width:** **240px** (matches the application-archetype context
  rail 240–280px). Sticky, `top: 64px` (below the header bar), self-height.
- **Reading-pane max width:** **768px** (`max-w-3xl`) for prose measure; tables and
  the diagram may bleed to the full pane width inside their card.
- **Header bar height:** 56–64px, sticky, `bg-raised/80` + `backdrop-blur`,
  `border-b border-border-subtle`.
- **Spacing scale:** Tailwind 4px base. Section card padding `p-6` (24px); gap
  between section cards `space-y-6`/`space-y-8`; inline control gaps `gap-2`/
  `gap-3`. Row density driven by `--row-h` (44px default, 32px in
  `[data-density="compact"]`) and `--pad-x`/`--pad-y` for the table.
- **Radii (tokens):** `--radius-md` (8px, `rounded-md`) default for inputs,
  buttons, cards; `--radius-lg` (12px, `rounded-lg`) for the diagram frame and
  large containers; `--radius-full` for badges/pills.
- **Elevation (tokens):** keep it flat. Page/cards rest on **hairline borders**
  (`border-border-subtle`), not shadows. Use `shadow-xs` for the input,
  `shadow-sm` for the section cards if any lift is wanted, `shadow-md` only for
  transient popovers/tooltips, `shadow-lg` for nothing here. Focus uses
  `--shadow-focus` (the most important visual — see §7).

---

## 5. Component styling

**Repo-URL input** (Home): `h-11`, `px-4`, `rounded-md`, `bg-raised`,
`border border-input`, `text-body-md`, placeholder `.text-tertiary`. URL value
shown in `font-mono` is a nice touch. Focus → `--shadow-focus` ring (do not
re-invent with a custom blue glow; the global `:focus-visible` already applies it).
Current `app/page.tsx` markup is correct.

**Primary button** ("Generate architecture doc"): `h-11`, `px-6`, `rounded-md`,
`bg-brand text-brand-foreground`, `font-medium text-body-md`, hover
`bg-brand-deep`, `disabled:opacity-50 disabled:cursor-not-allowed`,
`transition-colors duration-base`. Loading label "Generating…".

**Use sample repo** button: text/link style — `text-body-sm text-brand`, hover
`text-brand-deep`, `underline underline-offset-2`. Quiet, secondary.

**Section cards** (the four doc sections): `bg-raised`, `rounded-lg`,
`border border-border-subtle`, `p-6`. Each has an `id` for anchor nav and is a
landmark: `<section role="region" aria-labelledby="...-title">`. Header row =
serif H2 (`font-display text-heading-lg`) on the left + a **Regenerate** control
on the right, separated by a `border-b border-border-subtle pb-3 mb-4`. Apply the
**`.ai-tint`** signature (faint `hsl(var(--brand)/0.06)` bg + inset brand bar) to a
section while its content is freshly regenerated-but-unconfirmed, and
**`.agent-at-work`** shimmer on the placeholder during regenerate — this is the
Tenexity "agent touched this" tell.

**Sticky section-nav:** vertical list of anchors, each `text-body-md
text-secondary`, `px-3 py-2`, `rounded-md`. **Active** item (scroll-spy):
`text-brand font-medium` + `bg-accent` (brand-soft halo) + a 2px inset brand
left-bar (`box-shadow: inset 2px 0 0 hsl(var(--brand))`). A failed section's nav
item gets a `--danger` dot; a stale section gets a `--warning` dot. Top label is a
`.category-label` "Sections".

**Mermaid diagram container:** a labelled, framed artifact.
`<figure role="img" aria-label="Architecture diagram: <module summary>"
data-testid="mermaid-diagram">`. Frame: `bg-raised`, `rounded-lg`,
`border border-border-subtle`, inner canvas padding `p-4` over an optional
`bg-sunken` mat. A `<figcaption>` (the **label**) above or below in
`.category-label` style: "MODULE DIAGRAM". Nodes/edges use `--viz-*` and
`--border-default` per §2. Provide horizontal scroll/zoom-to-fit for large graphs;
never let it overflow silently. The diagram is **never the sole carrier of
meaning** — the `aria-label` summarizes module relationships and the Overview +
Codemap are the text alternative (per CHROMA §4).

**Module-map table:** Tenexity `DataTable` grammar. `w-full`, `text-body-md`.
Header row: `bg-sunken`, `text-tertiary`, `font-medium`, `text-caption`
uppercase-ish labels, `border-b border-border-default`. Body rows:
`border-b border-border-subtle`, hover `bg-sunken/60`, `--row-h` height. Module
name cell carries a leading `--viz-n` swatch dot matching the diagram node. Path /
count cells in `font-mono .tabular`. Right-align numerics.

**Codemap index:** a monospace, scannable list/tree of paths + symbols.
`font-mono text-body-sm`, sits on `bg-sunken` (a code "well") or `bg-raised` with
`border-border-subtle`. Paths in `text-secondary`, symbol names in
`text-foreground`, kind/line annotations in `.text-tertiary`. Group by directory;
indentation 16px steps. Optional leading line-number gutter in `.tabular
.text-tertiary`.

**Regenerate / Export / Copy-markdown buttons:** secondary/ghost button grammar —
`h-9`, `px-3`, `rounded-md`, `text-body-sm font-medium`, `bg-raised`,
`border border-border-default`, hover `bg-sunken`, `transition-colors`. Pair with a
small icon (refresh / download / clipboard). Regenerate lives per-section
(top-right of card header); Export + Copy markdown live in the doc header bar.
Copy-markdown shows a transient "Copied" confirmation (swap label / a `--success`
check) for ~1.5s. Use the same focus ring.

**Badges (stale / partial / error / ready):** pill, `rounded-full`, `px-2 py-0.5`,
`text-caption font-medium`, soft fill + matching text:
- **Stale:** `bg-warning-soft text-warning` (or `--warning` deepened for AA), dot +
  "Stale", `title="Repo changed since last generation"`.
- **Partial:** `bg-warning-soft text-warning`, "Partial".
- **Failed / error:** `bg-danger-soft text-danger`, "Failed".
- **Ready / success:** `bg-success-soft text-success`, "Ready" (also the
  `aria-live` announcement target).
- **Generating:** `bg-info-soft text-info` with a reduced-motion-aware pulsing dot.
Lean on the Confidence-cascade tokens (`--conf-*`) only if you later show
per-section synthesis confidence; otherwise status tokens suffice.

**Skeleton loaders (Generating state):** base `bg-sunken`, `rounded-md`, with the
**`shimmer`** animation (`animation-shimmer`, a translateX sweep) — already in
config. Build one skeleton per section matching its real shape: Overview = 3–4
text-line bars of varying width; Module map = a header bar + 4–5 row bars;
Diagram = a single large `rounded-lg` block with a centered spinner; Codemap = 6–8
short mono-width bars. Each pending section's nav item shows a pulsing
`--info`/brand dot. Pair with the `aria-live="polite"` "Generating…" announcement.

---

## 6. States & motion

State model is the `status` enum (CHROMA §3): `generating` · `ready` · `partial`
· `failed`, plus per-section `stale`.

- **Loading / Generating:** skeletons + `shimmer`; a spinner using `--brand`.
  `aria-live="polite"` announces "Generating…". Poll ~1.5s.
- **Empty:** Home with blank input → Generate disabled (`opacity-50`). A doc with
  no sections persisted → friendly placeholder in each card ("Not generated yet").
- **Partial:** ready sections render normally; failed sections show an inline card
  — `bg-danger-soft`, `border-border-subtle`, "Couldn't generate this section." +
  a **Regenerate** button. Nav marks the failed section with a `--danger` dot.
- **Error (failed):** full-width error card in the pane — `bg-danger-soft`,
  `text-danger` heading, the stored failure reason in `text-secondary`, and a
  **Try again** link back to `/`. Announce "Generation failed".
- **Stale:** amber **Stale** badge in the header (`--warning`), per-section
  `--warning` dot in nav, tooltip "Repo changed since last generation". Offer
  Regenerate.
- **Success (ready):** all four sections present; **Ready** badge; Export/Copy
  enabled; announce "Ready".

**Motion vocabulary (tokens only):** entrances `animation-fade-in` /
`animation-slide-up` (180–240ms, `--ease-out` cubic). Hover/press color via
`transition-colors duration-base` (180ms). Section content swap on regenerate:
fade-in + brief `.ai-tint`. The brand signatures `.agent-at-work` /
`agent-shimmer` mark in-flight synthesis. **No parallax, no large motion.**

**Reduced motion:** `tokens.css` already ships the global
`@media (prefers-reduced-motion: reduce)` block that neutralizes animations and
smooth scroll. Additionally, the generating **spinner must swap rotation for a
static or opacity-pulse indicator** under reduced motion (CHROMA §4) — don't rely
solely on the global rule for the spinner; gate it in component logic.

---

## 7. Accessibility

- **Contrast (WCAG AA, verified against tokens):**
  - `text-foreground` #18181B on `--background` #FAFAFA ≈ **16:1** and on
    `--raised` #FFF ≈ **17:1** — pass (AAA).
  - `--text-secondary` #52525B on #FFF ≈ **7.4:1** — pass AA/AAA for body.
  - `--text-tertiary` #8A8A92 on #FFF ≈ **3.3:1** — **labels/placeholder/large
    only**; never use for body or essential text.
  - Brand button: `--brand-foreground` #FFF on `--brand` #1A7BFF ≈ **3.6:1** —
    acceptable for the ≥`body-md`/medium-weight button label (large-text AA);
    where brand is used as *text on light* prefer `--brand-deep` #0958C9 (≈ 6:1 on
    white) for small text and links to clear AA comfortably.
  - Status text on its soft fill: deepen to the solid `--warning`/`--danger`/
    `--success` foreground value for the pill label so small badge text passes AA
    (the soft tints alone are decorative backgrounds).
- **Focus rings:** never remove. The global `:focus-visible` applies
  `--shadow-focus` (2px background gap + 4px brand halo) to every interactive
  element — keep it on nav anchors, buttons, the input, the Regenerate/Export/Copy
  controls. Don't override with a thinner custom ring.
- **Landmarks & headings:** doc `<h1>` for the repo/doc name; each section a
  `role="region"` with `aria-labelledby` pointing at its serif H2. On route change
  to `/doc/{id}`, move focus to `<h1>`/`#main-content` so SR users land in context
  (CHROMA §4).
- **Live region:** one `aria-live="polite"` region announces status transitions
  ("Generating…" → "Ready" / "Generation failed").
- **Diagram text alternative:** `role="img"` + descriptive `aria-label`
  summarizing module relationships; the Overview prose and Codemap index are the
  full accessible equivalent. The diagram must **never** be the sole carrier of
  meaning. Color in the diagram is reinforced by node labels (not color-only),
  and the `--viz-*` ramp is colorblind-safe (Okabe-Ito).
- **Keyboard:** Enter submits on Home (wired); nav anchors and all section
  controls are tab-reachable real `<a>`/`<button>` elements; copy/export reachable
  and operable without a pointer.
