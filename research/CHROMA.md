# CHROMA — UX Journeys & States

architecture.md turns a public GitHub repo URL into a living `ARCHITECTURE.md`: a prose
overview, a module map, a rendered Mermaid diagram, and a codemap index — viewable, editable
per-section, and export/commit-ready. This note defines the journeys, screens, states, and the
deterministic click-path the Stage-3 Playwright gate will assert.

## 1. Primary journey — "Generate an architecture doc from a repo URL"

1. User lands on **Home** (`/`). Reads the value prop, sees the URL input.
2. User pastes a public GitHub URL (or clicks **Use sample repo**, which fills the input with
   `https://github.com/sample/architecture-demo`). The **Generate architecture doc** button is
   disabled until the input is non-empty.
3. User clicks **Generate architecture doc** (or presses **Enter** in the field).
   → `POST /api/generate { repoUrl }`. The API creates a `Document` with `status: generating`,
   kicks off async synthesis, and returns `{ id }` immediately.
4. Client routes to `/doc/{id}` (**Document view**, in its **Generating** state).
5. Document view polls `GET /api/docs/{id}/status` (~1.5s interval). While `generating`, it shows
   the four sections as pending placeholders.
6. On `status: ready` (or `partial`/`failed`), polling stops and the client fetches the full doc
   via `GET /api/docs/{id}` and renders the four sections.
7. User reads/scrolls via sticky section nav, can **Regenerate** a section
   (`PATCH /api/docs/{id}/sections/{key}`), and **Export / Copy markdown**
   (`GET /api/docs/{id}/export`) to get commit-ready output.

## 2. Screens

- **Home** (`/`) — centered hero: category label "architecture.md", heading "Generate a living
  ARCHITECTURE.md", subhead, URL input (`aria-label="Repository URL"`), primary button, and the
  **Use sample repo** text button.
- **Generating** — the `/doc/{id}` page while `status === 'generating'`. Reduced-motion-aware
  spinner plus four section rows (Overview, Module map, Diagram, Codemap) shown as skeletons with
  per-section pending indicators.
- **Document view** (`/doc/{id}`) — left/sticky **section nav**: Overview · Module map · Diagram ·
  Codemap. Center pane renders each section: Overview (prose), Module map (table), Diagram
  (rendered Mermaid in a labelled container), Codemap (index). Each section header carries a
  **Regenerate** control. Header carries **Export** and **Copy markdown**, plus a **stale badge**
  when any section's `stale` flag is set.
- **Empty** — Home before any input (button disabled); also a doc with no sections persisted yet.
- **Error** — generation `failed`: inline error card with the failure reason and a **Try again**
  link back to `/`.
- **Not-found** — `GET /api/docs/{id}` 404s: "Document not found" with a link home.

## 3. States per screen (tied to `status` enum)

- **loading** — Home button shows "Generating…" and disables the field after submit; Document view
  polls during `generating`.
- **empty** — input blank → Generate disabled; no `Document` rows.
- **partial** — `status: partial`: render the ready sections normally; failed sections show an
  inline "Couldn't generate — Regenerate" affordance. Nav marks failed sections.
- **error** — `status: failed`: full-screen error card; reason read from the doc's stored error.
- **stale** — any section `stale: true` (repo HEAD moved past `headSha`, or `truncated`): amber
  **Stale** badge in the header with tooltip "Repo changed since last generation".
- **success** — `status: ready`: all four sections present and non-empty; export enabled.

## 4. Accessibility

- **Keyboard**: Enter in the URL field submits (already wired via `onKeyDown`). On route change to
  `/doc/{id}`, move focus to the document `<h1>` / `#main-content` so screen-reader users land in
  the new context. Section nav links are real anchors and tab-reachable; Regenerate/Export/Copy are
  `<button>`s.
- **ARIA**: `aria-label="Repository URL"` on the input; `aria-live="polite"` region announces
  status transitions ("Generating…", "Ready", "Generation failed"). Diagram container gets
  `role="img"` with an `aria-label` summary.
- **Contrast**: brand text/buttons meet WCAG AA (>=4.5:1) on the raised/background tokens; the
  stale badge uses an amber that passes AA against its fill.
- **Reduced motion**: the generating spinner respects `prefers-reduced-motion: reduce` — swap the
  rotation for a static/pulsing indicator.
- **Mermaid alternative**: the diagram is decorative-equivalent to text; the **Overview** prose and
  **Codemap** index are the accessible text alternative, and the diagram exposes the same module
  relationships via `aria-label`. Never make the diagram the sole carrier of meaning.

## Primary Happy-Flow Click-Path (Playwright gate)

Deterministic, selector-level sequence the Stage-3 test asserts. The **sample repo path runs fully
mocked** (`/api/generate` returns pre-baked `SAMPLE_SECTIONS` for `sample/architecture-demo`), so
the gate needs **no live GitHub or LLM credentials** and is reproducible.

1. `page.goto('/')`.
2. Assert heading is visible: `getByRole('heading', { name: 'Generate a living ARCHITECTURE.md' })`.
3. Click **Use sample repo**: `getByRole('button', { name: 'Use sample repo' })` — input
   (`getByLabel('Repository URL')`) now holds `https://github.com/sample/architecture-demo`.
4. Click **Generate architecture doc**: `getByRole('button', { name: 'Generate architecture doc' })`.
5. Wait for redirect: `await page.waitForURL(/\/doc\/.+/)`, then poll until status is `ready`
   (`getByText('Ready')` / `aria-live` region, or `expect.poll` on `GET /api/docs/{id}/status`).
6. Assert the **Overview** section renders non-empty text (`getByRole('region', { name: /overview/i })`
   has text) and the **Mermaid** container is present (`getByRole('img', { name: /diagram/i })` /
   `[data-testid="mermaid-diagram"]`).
7. Click **Copy markdown** / **Export** (`getByRole('button', { name: /copy markdown|export/i })`)
   and assert the resulting markdown contains a `# ` heading and a ```` ```mermaid ```` fence.
