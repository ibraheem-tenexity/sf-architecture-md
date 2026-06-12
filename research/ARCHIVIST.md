# ARCHIVIST — Reuse Scan

**Scope:** `/data/runs/sf-architecture-md/workspace/architecture-md/` — an existing, working Next.js prototype for architecture.md.
**Disposition: EXTEND.** A coherent end-to-end skeleton already exists (ingest → codemap → LLM synthesis → persist → API surface). Stage 2/3 should build on it, not fork or restart.

## 1. Inventory

**Stack (one line):** Next.js 16.2.9 (App Router, React 19, `output: standalone`) + Prisma 7 / SQLite + Tailwind 3 + OpenAI SDK pointed at OpenRouter (`anthropic/claude-sonnet-4-5`), GitHub via `@octokit/rest`, Mermaid + `@uiw/react-md-editor` + `react-markdown` on the client. Dockerized for Railway.

**Data model** (`prisma/schema.prisma`, one migration `20260612195234_init`): `Document` (repo metadata: owner/name/url, `defaultBranch`, `headSha`, `title`, `mermaid`, `status` = generating|ready|partial|failed, `truncated`, `codemap` JSON string, timestamps, `userId` defaulting to `demo-user`) and `DocumentSection` (`sectionKey` overview|module_map|diagram|codemap, `contentMd`, `position`, `aiGenerated`, `stale`, unique on `(documentId, sectionKey)`, cascade delete). The `stale` flag and `headSha` are already present — freshness was anticipated in the schema.

| File | Responsibility | State |
|---|---|---|
| `lib/ingestion.ts` | Octokit: resolve default branch + headSha, recursive tree (cap 2000 nodes), sample ~20 high-signal files (README, manifests, entrypoints) ≤50KB. Maps 403/404 to errors. | Solid |
| `lib/codemap.ts` | Heuristic codemap: group files by top-level dir → modules, detect dominant language by extension, mark entrypoints (main/index/app/server/cli), infer edges from relative `import ... from './x'`. Pure, typed. | Solid (heuristic) |
| `lib/synthesis.ts` | LLM synthesis via OpenAI SDK → OpenRouter, `response_format: json_object`, returns overview/module_map/diagram/codemap. Plus `validateMermaid` + `buildFallbackMermaid`. | Real wiring |
| `lib/sample-repo.ts` | Pre-baked codemap + sections for `github.com/sample/architecture-demo`. | Mock/fixture |
| `lib/prisma.ts` | Singleton PrismaClient (global in dev). | Solid |
| `lib/startup.ts` / `lib/db-init.ts` | Run `prisma migrate deploy` (fallback `db push`) at runtime; near-duplicate. | Solid, redundant |
| `app/api/generate/route.ts` | POST: create Document, fire-and-forget `runGeneration` (ingest→codemap→synth→persist sections→status ready/failed). | Core |
| `app/api/docs/route.ts` | GET list docs for demo-user. | Solid |
| `app/api/docs/[id]/route.ts` | GET doc+sections; DELETE doc. | Solid |
| `app/api/docs/[id]/status/route.ts` | GET status (for polling). | Solid |
| `app/api/docs/[id]/sections/[key]/route.ts` | PATCH section `content_md`, sets `aiGenerated=false` (edit persistence). | Solid |
| `app/api/docs/[id]/export/route.ts` | GET assembled ARCHITECTURE.md (sections + fenced `mermaid`). | Solid |
| `app/page.tsx` | Landing: URL input, "Generate", "Use sample repo"; routes to `/doc/{id}`. | Solid |
| `app/components/AppShell.tsx` | Three-rail layout; right rail is a "co-pilot coming soon" stub. | Partial |
| `app/layout.tsx`, `app/globals.css`, `tailwind.config.ts` | Root layout + ~300 lines of design-token CSS + full Tailwind theme (brand/viz/sidebar tokens, animations). | Solid, polished |
| `Dockerfile`, `next.config.ts`, `.env.example` | Multi-stage standalone build, migrate-on-boot, env contract (`DATABASE_URL`, `OPENROUTER_API_KEY`, `NEXTAUTH_*`). | Solid |

## 2. Reusability assessment

**Keep:** the whole ingest→codemap→synthesis→persist pipeline, the data model, all six API routes, the design system (Tailwind theme + globals.css are notably polished), and the Docker/Railway build. Section-level edit persistence and Markdown export already work. This is a real skeleton, not boilerplate.

**Stub / scaffold:** `app/components/AppShell.tsx` right rail ("AI co-pilot coming soon"); `lib/sample-repo.ts` fixtures; the two near-identical DB-init helpers (consolidate); `NEXTAUTH_*` env vars exist but no NextAuth is installed or wired.

## 3. Disposition: EXTEND — and why

The codebase already implements the full happy path with real GitHub ingestion and a real LLM call; status/polling, edits, and export endpoints exist; schema, migration, and deploy are done. Forking or restarting would discard a working pipeline and a polished design system. Concrete gaps Stage 2/3 must close:

1. **Missing doc viewer page (critical).** `page.tsx` navigates to `/doc/{id}` but there is **no `app/doc/[id]/` route** — the primary view doesn't exist. Build it: poll `status`, render sections, Mermaid diagram, editor, export button.
2. **Auth.** Everything is hardcoded to `userId = 'demo-user'`; `NEXTAUTH_*` is declared but unimplemented. Wire real auth + ownership scoping.
3. **Freshness / re-generation.** Schema has `headSha` + `stale` but nothing compares HEAD or re-runs synthesis; add a refresh endpoint that marks sections stale and regenerates.
4. **LLM provider.** Synthesis targets OpenRouter (`anthropic/claude-sonnet-4-5`) via the OpenAI SDK, not the Anthropic SDK — confirm this is the intended path or migrate to `@anthropic-ai/sdk`.
5. **Edit/export polish.** PATCH lacks Mermaid re-validation; export omits standalone diagram safety; no "regenerate single section."

## 4. Risks in the existing code

- **Sample path bypasses the real pipeline.** In `runGeneration`, any URL containing `sample/architecture-demo` short-circuits to `SAMPLE_CODEMAP`/`SAMPLE_SECTIONS` (both ingestion **and** synthesis). Useful for Playwright/demo, but demos may pass even if real ingest/LLM is broken — don't mistake green sample runs for working generation.
- **Silent LLM fallback.** If `synthesizeArchitecture` throws (no `OPENROUTER_API_KEY`, bad JSON, rate limit), `generate` catches and writes a thin codemap-only doc and still marks status `ready` — failures look like success. Surface a degraded/`partial` status instead.
- **Heuristic codemap is shallow.** Modules = top-level dirs only; edges come from a single regex over ~20 sampled files; languages by extension. Large/monorepo/non-JS repos will under-report. The 2000-node / 20-file caps set `truncated` but quality silently degrades.
- **No input hardening beyond a regex.** `OPENROUTER_API_KEY` is a build-time placeholder in the Dockerfile; ensure real injection at runtime.
- **Duplicate DB-init helpers** (`startup.ts` vs `db-init.ts`) and `NEXTAUTH_*` env present with no NextAuth dependency — leftover scaffolding to reconcile.
