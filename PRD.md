# architecture.md — Product Requirements Document

**Thesis.** architecture.md connects a public GitHub repo URL and auto-generates a living `ARCHITECTURE.md` — a prose overview, a module map, a rendered Mermaid diagram, and a codemap index — that is viewable, per-section editable, and export/commit-ready. The differentiator is not the generation (everyone can prompt an LLM over a repo) but the artifact and the workflow: a Markdown file you own, in your tree, that regenerates as the code changes so the doc never rots.

**Status:** Extends the existing Next.js prototype — see `research/ARCHIVIST.md`. The ingest → codemap → LLM-synthesis → persist pipeline, the data model, and all six API routes already exist and work; this PRD scopes the MVP as closing the critical gaps on top of that skeleton, not a rebuild.

---

## Product thesis

The wedge is **a committed, per-section-editable, in-repo Markdown artifact plus an anti-rot regeneration loop** (per `research/VANGUARD.md`).

- **Why now / why us — the output is a file you own, in your repo.** A committed `ARCHITECTURE.md` is diff-able, PR-reviewable, version-controlled, and rendered natively by GitHub (Mermaid included). Every direct competitor (DeepWiki, GitDiagram, Swimm) keeps the artifact on *their* platform. "It lives in your tree" is the moat and the only durable answer to the "living docs" promise.
- **Per-section editing closes the trust gap.** LLM output is never 100% right. The killer feature is letting a human correct one section (and regenerate only that section) instead of accepting or discarding a whole hosted wiki. None of DeepWiki / GitDiagram / Swark expose this.
- **One coherent artifact, four views in one place** — prose overview + module map + rendered Mermaid + codemap index. Competitors deliver slices (GitDiagram = diagram only, Mintlify = hosting only, CodeScene = metrics only, DeepWiki = hosted wiki only). architecture.md is the assembled, single-page document a new engineer actually reads top-to-bottom.
- **Anti-rot regeneration as the core loop.** Regenerate-on-change targeting a *committed* file is a story DeepWiki (hosted) and Doxygen/Structurizr (manual upkeep) can't tell cleanly. The schema already carries `headSha` + a per-section `stale` flag, signaling this intent. CodeSee's death (visualization with no durable artifact and no daily loop) shows why this loop is the recurring-value engine.

---

## Users & jobs-to-be-done

The buyer is an engineering org (platform/DevEx team or an EM) that owns codebase health; the daily users are individual engineers facing unfamiliar code (per `research/HORIZON.md`).

**Personas**
- **The inheriting staff/lead engineer.** Joins a team or picks up an orphaned service and must understand module boundaries and data flow before touching anything. Pain: days spent reverse-engineering structure from `grep` and tribal knowledge; ships with shaky mental models.
- **The OSS maintainer.** Wants new contributors to ramp without 1:1 hand-holding and a credible architecture doc in the repo. Pain: no time to hand-write and maintain one; existing docs rot after the first refactor.
- **The tech lead / EM onboarding new hires.** Needs a reliable "here's how the system fits together" artifact for every joiner. Pain: onboarding docs are stale, scattered, or nonexistent.
- **The PR reviewer.** Reviewing a change in code they don't own. Pain: lacks the surrounding architecture context to judge whether a change respects module boundaries.

**Primary JTBD.** *When I inherit or join an unfamiliar repo, I want an accurate architecture overview without spending days reverse-engineering it, so I can contribute safely and quickly.*

**Secondary JTBD**
- **Keep docs from rotting** — regenerate the overview as the code changes so the doc stays trustworthy (drift signaled via per-section `stale` + `headSha`).
- **Onboard new hires** — hand every joiner a current, repo-committed architecture map instead of a tribal-knowledge walkthrough.
- **Give PR-review context** — a module map + diagram a reviewer can glance at to understand blast radius.

---

## Competitive landscape

All URLs verified during research (`research/VANGUARD.md`). architecture.md sits at the intersection of "AI repo → docs/wiki generators" and "diagram-from-repo tools," distinguished by the single committed Markdown artifact + per-section edit + regeneration loop.

| Competitor | URL | What it does | Gap vs architecture.md |
|---|---|---|---|
| DeepWiki (Cognition/Devin) | https://deepwiki.com/ | Auto-indexes public repos into a hosted wiki: diagrams, module explanations, source-linked summaries, "Ask Devin" Q&A. | Hosted wiki, not a file you own. No per-section editing, no Markdown export, no commit-back. A destination, not a living `ARCHITECTURE.md`. |
| GitDiagram | https://gitdiagram.com/ | Swap `github.com`→`gitdiagram.com`; Claude-Sonnet two-pass pipeline renders clickable Mermaid diagrams. OSS. | Diagram-only. No prose doc, no module index, no per-section editing, no Markdown export to commit. |
| Swimm | https://swimm.io/ | Pivoted to a code-modernization platform (refactoring, migrations, agentic context via MCP); still does dependency/architecture maps. | Enterprise services/migration engagement. Output is a queryable knowledge base, not a committed Markdown file. Sales-led, not OSS-friendly. |
| CodeScene | https://codescene.com/ | Behavioral code analysis: hotspots, change-coupling, code-health, bus-factor, PR/CI integration. | Risk/quality dashboards and metrics, not an explanatory prose-plus-diagram doc. Different JTBD; potential v2 data source. |
| Aider repo-map | https://aider.chat/docs/repomap.html | tree-sitter ASTs across 130+ languages → PageRank-ranked, token-budgeted file-dependency graph feeding an LLM. | A context-feeding technique inside a coding tool, not a product emitting a human-readable doc. Our v2 engine blueprint, not a competitor. |
| Swark | https://github.com/swark-io/swark | VS Code extension; LLM-generated Mermaid architecture diagrams from code. OSS. | IDE-only, diagram-only, no prose doc, no module index, no committed artifact. |
| CodeSee → GitKraken | https://www.codesee.io/ | Auto-generated codebase maps / "living docs" visualizations. | Defunct as a standalone (shutdown Feb 2024, folded into GitKraken). Lesson: visualization without a durable ownable artifact and a daily loop didn't last. |
| Sourcegraph Cody | https://sourcegraph.com/docs/cody | Whole-codebase context via code graph + embeddings; chat, inline edits, doc/test gen. Enterprise-only as of mid-2025. | IDE coding assistant, not a generator of a standalone committed doc. Comprehension is ephemeral, in-session. |
| Mintlify | https://mintlify.com/ | Docs hosting/authoring with an AI agent; supports `llms.txt`/MCP. | Does not generate architecture from source or build diagrams from a repo. A downstream publishing target, not a generation competitor. |
| Mermaid Chart | https://www.mermaidchart.com/ | The rendering substrate; AI-assisted diagramming + editor. | A diagramming tool/standard, not a repo-comprehension product. Complementary — we emit Mermaid GitHub renders natively. |

**Where we win.** The defensible wedge is the artifact + the workflow, not the generation. Concretely: (1) the output is a Markdown file in *your* repo, diff-able and GitHub-rendered; (2) per-section edit + single-section regenerate closes the LLM trust gap none of the hosted competitors expose; (3) one coherent four-view document vs. competitors' slices; (4) anti-rot regenerate-on-change against a committed file; (5) frictionless, public-repo, paste-a-URL, free-to-try positioning that avoids Swimm's sales-led and Cody's enterprise gates.

---

## User journeys & screens

Per `research/CHROMA.md`. Three primary screens: **Home**, **Generating**, **Document view**.

**Happy-flow (primary journey).**
1. User lands on **Home** (`/`), reads the value prop, sees the URL input.
2. User pastes a public GitHub URL or clicks **Use sample repo** (fills `https://github.com/sample/architecture-demo`). The **Generate architecture doc** button is disabled until input is non-empty.
3. User clicks **Generate architecture doc** (or presses **Enter**). → `POST /api/generate { repoUrl }` creates a `Document` with `status: generating`, kicks off async synthesis, returns `{ id }` immediately.
4. Client routes to `/doc/{id}` (**Document view**, **Generating** state).
5. Document view polls `GET /api/docs/{id}/status` (~1.5s). While `generating`, the four sections show as pending skeletons.
6. On `ready` / `partial` / `failed`, polling stops; client fetches the full doc (`GET /api/docs/{id}`) and renders the four sections.
7. User reads via sticky section nav, can **Regenerate** a section, and **Export / Copy markdown** (`GET /api/docs/{id}/export`) for commit-ready output.

**Screens & states.**
- **Home (`/`)** — centered hero: category label "architecture.md", heading "Generate a living ARCHITECTURE.md", subhead, URL input (`aria-label="Repository URL"`), primary button, quiet **Use sample repo** text button. *Empty* state: blank input → Generate disabled.
- **Generating (`/doc/{id}` while `status==='generating'`)** — reduced-motion-aware spinner + four section skeletons (Overview, Module map, Diagram, Codemap) with per-section pending indicators; `aria-live` announces "Generating…".
- **Document view (`/doc/{id}`)** — sticky left section nav (Overview · Module map · Diagram · Codemap); center pane renders Overview (prose), Module map (table), Diagram (rendered Mermaid in a labelled `role="img"` container), Codemap (index). Each section header carries **Regenerate**; the header carries **Export** + **Copy markdown** + a **Stale** badge when any section's `stale` flag is set.
- **Partial** — ready sections render; failed sections show inline "Couldn't generate — Regenerate"; nav marks failed sections.
- **Error (failed)** — full-width error card with the stored failure reason + a **Try again** link to `/`.
- **Not-found** — `GET /api/docs/{id}` 404s: "Document not found" + link home.
- **Stale** — any section `stale: true` (HEAD moved past `headSha`, or `truncated`): amber Stale badge, tooltip "Repo changed since last generation".

---

## MVP scope

Ship by **extending the prototype** and closing the critical gaps from `research/ARCHIVIST.md`. Explicitly:

1. **Build the missing `/doc/[id]` viewer page (critical).** `page.tsx` navigates to `/doc/{id}` but there is no `app/doc/[id]/` route today — the primary view doesn't exist. Build it: poll status, render the four sections, render Mermaid in a labelled container, per-section edit + regenerate, Export/Copy markdown, stale badge, and the partial/failed/not-found states.
2. **Harden generation status — surface partial/degraded instead of silent fallback.** Today, if `synthesizeArchitecture` throws (no `OPENROUTER_API_KEY`, bad JSON, rate limit), `generate` writes a thin codemap-only doc and still marks `status: ready` — failures look like success. The MVP must set `status: partial` (or per-section failed) and surface a degraded indicator, never silently green.
3. **Per-section regenerate.** Add a regenerate endpoint that re-synthesizes a single section from the persisted codemap (distinct from the existing manual-overwrite PATCH). This is the trust mechanism and ships regardless of engine.
4. **Export / copy markdown.** Keep and harden the existing export route so output always contains a `#` heading and a fenced ```` ```mermaid ```` block that renders on GitHub; wire Copy markdown with a transient "Copied" confirmation.
5. **Freshness / stale surfacing.** Compute and surface drift: compare repo HEAD to stored `headSha` (and reflect `truncated`) to set/display the per-section `stale` flag and the header Stale badge. (Full re-run lifecycle can be triggered via per-section regenerate.)
6. **Apply the Tenexity design system** across Home + Document view per `research/DESIGNER.md` (tokens, section cards, sticky nav, Mermaid figure, skeletons).
7. **Keep the pre-baked sample-repo path** so the Stage-3 Playwright gate runs fully mocked, with no live GitHub/LLM credentials.

The accuracy engine for MVP stays the current heuristic codemap + LLM synthesis (it works, it's cheap, it streams); tree-sitter-grounded edges are a fast-follow (`research/VANGUARD.md`).

---

## Out of scope (MVP)

These are v2 (per `research/HORIZON.md`, `research/VANGUARD.md`):
- **No write-back / commit via GitHub App.** "Commit-ready" in MVP means valid exported Markdown to paste in; no PR/commit route.
- **No real multi-tenant auth beyond `demo-user`.** Everything stays scoped to the hardcoded `demo-user`; `NEXTAUTH_*` env exists but no auth is wired.
- **No deep/semantic analysis.** Modules are directory-level heuristics; tree-sitter def/ref graphs, PageRank ranking, and the full language set are v2.
- **No webhook-driven auto-refresh.** No CI/PR hook auto-regeneration; the MVP surfaces staleness and offers manual per-section regenerate, but the dev-loop hook is v2.
- **No private repos.** Public GitHub repos only.

---

## Features

1. **Repo ingestion** (`lib/ingestion.ts`) — Octokit resolves default branch + `headSha`, walks the tree (cap 2000 nodes), samples ~20 high-signal files (README, manifests, entrypoints) ≤50KB; maps 403/404 to user-facing errors. *Keep.*
2. **Heuristic codemap** (`lib/codemap.ts`) — groups files by top-level directory into modules, detects dominant language by extension, marks entrypoints, infers edges from relative `import … from './x'`. *Keep; harden edges with tree-sitter in fast-follow.*
3. **LLM synthesis** (`lib/synthesis.ts`) — OpenAI SDK → OpenRouter (`anthropic/claude-sonnet-4-5`), `response_format: json_object`, returns overview / module_map / diagram / codemap; includes `validateMermaid` + `buildFallbackMermaid`. Prompt hard-constrains the model to codemap module IDs only (no fabricated modules/paths). *Keep; surface failures as `partial` rather than silent fallback.*
4. **Async generate + status** (`app/api/generate/route.ts`, `app/api/docs/[id]/status/route.ts`) — POST creates the `Document`, fire-and-forget `runGeneration`, returns `{ id }`; status endpoint drives ~1.5s polling. *Keep; fix the silent-`ready` fallback.*
5. **Document + sections persistence** (`prisma/schema.prisma`) — `Document` (repo metadata, `defaultBranch`, `headSha`, `status` generating|ready|partial|failed, `truncated`, `codemap` JSON) + `DocumentSection` (`overview|module_map|diagram|codemap`, `contentMd`, `position`, `aiGenerated`, `stale`). *Keep.*
6. **Doc fetch / list / delete** (`app/api/docs/route.ts`, `app/api/docs/[id]/route.ts`) — list docs for `demo-user`; GET doc+sections; DELETE. *Keep.*
7. **Per-section manual edit** (`app/api/docs/[id]/sections/[key]/route.ts`) — PATCH `content_md`, sets `aiGenerated=false`. *Keep; add Mermaid re-validation on diagram edits.*
8. **Markdown export** (`app/api/docs/[id]/export/route.ts`) — assembles `ARCHITECTURE.md` from sections with a fenced `mermaid` block. *Keep; harden to always include a `#` heading + diagram fence.*
9. **Document viewer page** — `app/doc/[id]/page.tsx` (**NEW, critical**) — polls status, renders the four sections, Mermaid figure, per-section edit/regenerate, Export/Copy, stale badge, and all states.
10. **Per-section regenerate endpoint** — (**NEW**) re-synthesize one section from the persisted codemap, set `aiGenerated=true`, clear that section's `stale` flag.
11. **Freshness / stale detection** — (**NEW**) compare HEAD vs stored `headSha` (and reflect `truncated`) to set/surface per-section `stale` + the header Stale badge.
12. **Sample-repo fixture path** (`lib/sample-repo.ts`) — pre-baked codemap + sections for `github.com/sample/architecture-demo`; short-circuits ingest+synthesis for a credential-free, deterministic demo/Playwright run. *Keep.*
13. **Tenexity design system** (`app/globals.css`, `tailwind.config.ts`) — token CSS + Tailwind theme. *Keep; apply across both pages per DESIGNER.*

---

## Non-functional requirements (NFRs)

- **Performance.** Time-to-first-useful-doc < ~60s from paste-to-readable for a typical repo. The flow is async (POST returns an id immediately; status flips `generating → ready`). Synthesis capped at 4000 max tokens / ~50 files of context.
- **Accuracy / trust.** Module map and diagram must reflect the real top-level structure with **no fabricated modules or paths** — the synthesis prompt hard-constrains the model to codemap module IDs only, and `validateMermaid` rejects malformed diagrams. Target: ≥80% of generated docs accepted with light edits, not a rewrite.
- **Reliability — no silent failure.** A synthesis error must surface as `partial`/`failed` (or per-section failed), never a silently-`ready` codemap-only doc. Generation errors store a reason the UI can display.
- **Accessibility (WCAG AA).** Keyboard: Enter submits on Home; nav anchors + all controls are tab-reachable real `<a>`/`<button>`; focus moves to the doc `<h1>`/`#main-content` on route change. One `aria-live="polite"` region announces status transitions. Diagram is `role="img"` with a descriptive `aria-label` and is **never the sole carrier of meaning** (Overview + Codemap are the text alternative). Reduced motion: the spinner swaps rotation for a static/opacity-pulse indicator under `prefers-reduced-motion`. Contrast meets AA (text ≈16:1; links use `--brand-deep` for small text); status badge text deepened to AA on its soft fill.
- **Security.** Public repos only; reject non-GitHub/private URLs with a clear message ("Repository not found or is private"). Validate `repoUrl` input. Secrets (`OPENROUTER_API_KEY`, optional `GITHUB_TOKEN`) injected at runtime, never committed or baked into the image as real values.
- **Cost.** Token caps enforced (4000 max tokens, ~50 files, 2000 tree-node / 20-sample-file ingestion caps that set `truncated`); per-section regenerate re-runs only the changed section to bound cost. Hard repo-size ceiling and per-repo rate limiting on the free public path.

---

## Design guidance

Tenexity brand (full spec: `research/DESIGNER.md`). A developer tool: precise, calm, technical, trustworthy, light-first. Elegance from precision — hairline borders, generous whitespace, one accent (Tenexity Blue), monospace for code-shaped content. **Never hard-code hex; use `hsl(var(--token))` or the Tailwind theme key.** The deployed CSS must contain `--brand: 214 100% 55%` (gate check).

- **Archetypes.** Primary: **Doc Generator** (input → async synthesis → structured document with per-section regenerate). Secondary: **Record Editor** for the Document view (sticky left section index + center editable reading pane). **Lineage** informs only the Mermaid container.
- **Layout.** Home: centered single-column hero, `max-w-2xl`, `bg-background` (#FAFAFA) with the input on `bg-raised` (#FFFFFF). Document view: `container` (max 1400px), 2-track grid `grid-cols-[240px_minmax(0,1fr)]`, sticky 240px section-nav rail, reading pane capped `max-w-3xl` (768px), sticky 56–64px header bar (`bg-raised/80` + backdrop-blur, hairline bottom border).
- **Palette tokens.** `--brand`/`--primary` #1A7BFF (buttons, links, active nav, focus ring), `--brand-deep` #0958C9 (hover, small text), `--brand-soft`/`--accent` #E8F1FF (active-nav halo, ai-tint). Status tokens only — `--success`, `--warning` (stale/partial), `--danger` (failed), `--info` (generating). Diagram/module-map color exclusively from the `--viz-1..7` ramp (Okabe-Ito, colorblind-safe); edges in `--border-default`; wire Mermaid `themeVariables` to tokens.
- **Typography.** `--font-sans` Hanken Grotesk (UI/body); `--font-display` Georgia 700 (Home hero + section H2 titles — the editorial signature); `--font-mono` JetBrains Mono (paths, codemap, symbols, raw Mermaid, SHAs). Scale via `display-lg` (hero) … `caption`/`micro` (`.category-label`). Two-step weight rhythm (400 body, 500 medium chrome, 700 only for serif titles).
- **Components & signatures.** Section cards (`bg-raised`, `rounded-lg`, hairline border, `p-6`, `role="region"` + `aria-labelledby`) with serif H2 + per-section Regenerate; `.ai-tint` + `.agent-at-work` shimmer mark freshly-regenerated/in-flight sections (the Tenexity "agent touched this" tell). Mermaid `<figure role="img" data-testid="mermaid-diagram">` with a `.category-label` `<figcaption>`. Status badges as soft-fill pills. Skeleton loaders use the `shimmer` animation, one per section shape. Flat elevation — rest on hairline borders, focus uses `--shadow-focus` (never removed).

---

## Acceptance criteria

Each criterion is in **Given / When / Then** form with a **Verification** line. These drive the Stage-3 gate.

**AC-1 — Primary happy-flow click-path (the Playwright gate).**
**Given** the app is running and I am on Home (`/`),
**When** I click **Use sample repo**, then click **Generate architecture doc**, get redirected to `/doc/{id}`, and wait for status to become `ready`,
**Then** the **Overview** section renders non-empty text AND the **Mermaid** diagram container is present, AND clicking **Copy markdown / Export** yields markdown containing a `# ` heading and a ```` ```mermaid ```` fence.
**Verification:** Playwright — `getByRole('heading', { name: 'Generate a living ARCHITECTURE.md' })` visible; `getByRole('button', { name: 'Use sample repo' })`; `getByLabel('Repository URL')` holds `https://github.com/sample/architecture-demo`; `getByRole('button', { name: 'Generate architecture doc' })`; `page.waitForURL(/\/doc\/.+/)`; poll until `getByText('Ready')` / `aria-live`; `getByRole('region', { name: /overview/i })` has text; `getByRole('img', { name: /diagram/i })` / `[data-testid="mermaid-diagram"]` present; assert export string matches `/# /` and ```` /```mermaid/ ````. Runs fully mocked (sample path), no live GitHub/LLM credentials.

**AC-2 — Generating / polling state.**
**Given** I have submitted a repo and landed on `/doc/{id}` while `status === 'generating'`,
**When** the page polls `GET /api/docs/{id}/status` (~1.5s interval),
**Then** the four sections show as pending skeletons, an `aria-live="polite"` region announces "Generating…", and on `ready`/`partial`/`failed` polling stops and the full doc renders.
**Verification:** Playwright asserts skeleton placeholders + `aria-live` text "Generating…"; API assertion that `/status` is polled and returns the enum value; mock a delayed status to observe the transition.

**AC-3 — Partial / failed surfacing (no silent fallback).**
**Given** synthesis fails for a repo (e.g. `OPENROUTER_API_KEY` unset or the LLM returns bad JSON),
**When** generation completes,
**Then** the document status is `partial` (or `failed`), NOT silently `ready`; the UI shows a degraded/error indicator with a reason and a per-section **Regenerate** (or full-screen **Try again**) affordance.
**Verification:** API/unit test — force a synthesis throw and assert the persisted `Document.status` is `partial`/`failed` and a reason is stored; Playwright asserts the degraded inline card / error card renders (not a green Ready).

**AC-4 — Per-section regenerate.**
**Given** I am viewing a ready document,
**When** I click **Regenerate** on a single section,
**Then** only that section is re-synthesized from the persisted codemap, `aiGenerated` is set true, its `stale` flag clears, an `.ai-tint`/`agent-at-work` indicator shows during the call, and the new content replaces the old without touching other sections.
**Verification:** API assertion that the regenerate endpoint updates exactly one `DocumentSection` row; Playwright asserts the section content changes and other sections are untouched.

**AC-5 — Export markdown validity.**
**Given** a ready document,
**When** I call `GET /api/docs/{id}/export` (or click Copy markdown),
**Then** the returned markdown contains a top-level `# ` heading, the assembled section content, and a fenced ```` ```mermaid ```` block with the diagram source, valid enough to render on GitHub.
**Verification:** API test asserts the response body matches `/^# /m` and contains ```` ```mermaid ````; Playwright asserts the Copy button shows a transient "Copied" confirmation.

**AC-6 — Stale badge.**
**Given** a document whose stored `headSha` differs from the repo's current HEAD (or whose ingestion was `truncated`),
**When** I open the Document view,
**Then** an amber **Stale** badge appears in the header with tooltip "Repo changed since last generation," and affected nav items show a `--warning` dot.
**Verification:** Set a section `stale: true` (or a mismatched `headSha`) in a fixture; Playwright asserts the Stale badge is visible with the correct `title`, and the badge uses `--warning` tokens (no ad-hoc amber).

**AC-7 — Accessibility (keyboard submit + aria-live).**
**Given** I am on Home using only the keyboard,
**When** I type a URL and press **Enter** in the field,
**Then** generation submits (no pointer needed); and on the Document view, the `aria-live="polite"` region announces status transitions ("Generating…" → "Ready"/"Generation failed"), focus moves to the doc `<h1>`/`#main-content` on route change, and the diagram exposes `role="img"` + a descriptive `aria-label`.
**Verification:** Playwright keyboard-only flow (`press('Enter')`); assert `aria-live` text updates; assert focus lands on `<h1>` after navigation; axe-core / manual audit for WCAG AA contrast, focus rings, and reduced-motion spinner swap.

**AC-8 — No fabricated modules (trust constraint).**
**Given** a generated diagram and module map,
**When** the content is produced by synthesis,
**Then** every module ID / path in the diagram and module map exists in the input codemap — no module, file, or path is invented.
**Verification:** Unit/integration test cross-checks all Mermaid node IDs and module-map paths against `codemap.modules[].id`/`path`; `validateMermaid` rejects diagrams not starting with `flowchart`/`graph` and falls back to a codemap-only diagram; assert no node ID outside the codemap set.

**AC-9 — Not-found handling.**
**Given** a `/doc/{id}` for an id that does not exist,
**When** the viewer fetches `GET /api/docs/{id}` and receives 404,
**Then** the page shows "Document not found" with a link home (no crash, no infinite poll).
**Verification:** Playwright navigates to a bogus id; asserts the not-found copy + home link; API returns 404.

---

## Ticket seeds

Stable IDs seed Stage 2 ticketing. Each: ID · title · one-line scope · acceptance criterion satisfied. These cover the critical gaps from `research/ARCHIVIST.md`. Each row below is a ticket seed.

| ID | Title | Scope (one line) | Satisfies |
|---|---|---|---|
| AM-01 | Build `/doc/[id]` viewer page | Create `app/doc/[id]/page.tsx`: poll status, render the four sections, Mermaid figure, sticky section nav, Export/Copy, all states. | AC-1, AC-2, AC-9 |
| AM-02 | Generating state + polling + aria-live | Skeleton loaders per section, ~1.5s status poll, reduced-motion spinner, `aria-live="polite"` "Generating…" announcement. | AC-2, AC-7 |
| AM-03 | Fix silent LLM fallback → partial/failed status | In `runGeneration`, when synthesis throws, set `status: partial`/`failed` with a stored reason instead of a silently-`ready` codemap-only doc. | AC-3 |
| AM-04 | Partial/error UI surfacing | Render inline "Couldn't generate this section — Regenerate" for failed sections and a full-width error card with **Try again** for `failed`. | AC-3 |
| AM-05 | Per-section regenerate endpoint | New route to re-synthesize one section from the persisted codemap; sets `aiGenerated=true`, clears that section's `stale`. | AC-4 |
| AM-06 | Per-section regenerate UI | Wire Regenerate buttons in each section card header with `.ai-tint`/`agent-at-work` in-flight indicator. | AC-4 |
| AM-07 | Harden Markdown export | Guarantee export always has a `# ` heading + a fenced ```mermaid``` block; add standalone-diagram safety; Copy markdown with "Copied" confirmation. | AC-5 |
| AM-08 | Mermaid re-validation on section edit | On PATCH of the diagram section, re-run `validateMermaid` so manual edits can't persist a broken diagram. | AC-5, AC-8 |
| AM-09 | Freshness / stale detection + badge | Compare repo HEAD vs stored `headSha` (and reflect `truncated`); set/surface per-section `stale` + the header Stale badge with tooltip. | AC-6 |
| AM-10 | No-fabricated-modules guard | Cross-check diagram node IDs + module-map paths against `codemap.modules`; reject/repair anything outside the codemap set. | AC-8 |
| AM-11 | Apply Tenexity design system to both pages | Section cards, sticky nav, Mermaid figure, badges, skeletons, tokens per `research/DESIGNER.md`; verify `--brand: 214 100% 55%` ships. | AC-6, AC-7 |
| AM-12 | Accessibility pass | Keyboard submit, focus-to-`<h1>` on route change, diagram `role="img"`+`aria-label`, AA contrast, reduced-motion spinner, focus rings. | AC-7 |
| AM-13 | Playwright happy-flow gate | Author the deterministic sample-path test asserting the full CHROMA click-path (Home → generate → ready → Overview non-empty + Mermaid present → export contains `#` + `mermaid` fence). | AC-1 |
| AM-14 | Consolidate DB-init + sample-path hygiene | Merge the near-duplicate `startup.ts`/`db-init.ts`; ensure the sample short-circuit is clearly test-only and not mistaken for real-pipeline health. | AC-1, AC-3 |
