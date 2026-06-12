# HORIZON — Context Assembly

**App:** architecture.md — connect a public GitHub repo and auto-generate a living `ARCHITECTURE.md` (prose overview, module map, Mermaid diagram, codemap index), ready to commit back to the repo.

## 1. Customer & users

The buyer is typically an engineering org (platform/DevEx team or an EM) that owns codebase health; the daily users are individual engineers facing unfamiliar code. Concrete personas:

- **The inheriting staff/lead engineer.** Joins a team or picks up an orphaned service and must understand module boundaries and data flow before touching anything. Pain: spends days reverse-engineering structure from `grep` and tribal knowledge, and ships with shaky mental models.
- **The OSS maintainer.** Wants new contributors to ramp without 1:1 hand-holding and wants a credible architecture doc in the repo. Pain: no time to hand-write and maintain one; existing docs rot after the first refactor.
- **The tech lead / EM onboarding new hires.** Needs a reliable "here's how the system fits together" artifact for every new engineer. Pain: onboarding docs are stale, scattered, or nonexistent; same questions answered repeatedly.
- **The PR reviewer.** Reviewing a change in code they don't own. Pain: lacks the surrounding architecture context to judge whether a change respects module boundaries.

## 2. Job-to-be-done

**Primary JTBD:** *When I inherit or join an unfamiliar repo, I want an accurate architecture overview without spending days reverse-engineering it, so I can contribute safely and quickly.*

Secondary jobs:
- **Keep docs from rotting** — regenerate the overview as the code changes so the doc stays trustworthy (the data model carries a per-section `stale` flag and a `headSha`, signaling drift-detection intent).
- **Onboard new hires** — hand every joiner a current, repo-committed architecture map instead of a tribal-knowledge walkthrough.
- **Give PR review context** — a module map + diagram a reviewer can glance at to understand blast radius.

## 3. Success criteria (measurable where possible)

- **Time-to-first-useful-doc:** from pasting a repo URL to a readable overview in under ~60s for a typical repo (the flow is async: POST `/api/generate` returns an id immediately, then status polling flips `generating → ready`).
- **Accuracy / trust:** module map and diagram reflect the real top-level structure with no fabricated modules or paths (the synthesis prompt hard-constrains the model to codemap IDs only). Target: users accept the generated doc with light edits, not a rewrite — e.g. ≥80% of generated docs committed with only minor manual edits.
- **Freshness:** doc can be regenerated against a new `headSha` and stale sections flagged, so the committed doc doesn't silently drift from `main`.
- **Commit-ready output:** export produces clean, valid Markdown (with a fenced ```mermaid block) that renders on GitHub and can be dropped in as `ARCHITECTURE.md` with zero reformatting.

## 4. Scope signals from the prototype

**In scope (MVP):**
- Public GitHub repos only — ingestion uses an optional `GITHUB_TOKEN`; a 404 is surfaced as "Repository not found or is private."
- Four fixed section types: `overview | module_map | diagram | codemap`, persisted as `DocumentSection` rows with stable positions.
- Heuristic codemap: files grouped by top-level directory into modules, language by extension, edges from relative `import`/`from` statements — then LLM synthesis on top.
- Async generate + status polling, with `failed`/fallback handling (a non-LLM codemap-only doc if synthesis throws).
- Manual per-section editing via PATCH (sets `aiGenerated: false`) and a read-only Markdown export endpoint.
- A pre-baked sample repo for reliable demo/testing.

**Out of scope / not yet built (despite schema hints):**
- **No write-back to GitHub** — "commit-ready" today means export JSON/Markdown; there is no PR/commit route.
- **No per-section LLM regenerate** — the section route is a manual content overwrite, not a re-synthesis; `stale` is in the schema but nothing sets or acts on it yet.
- **No real auth / multi-tenant** — every request is hardcoded `demo-user`; `userId` exists but isn't wired to real identity.
- **No deep/semantic analysis** — modules are directory-level heuristics; large repos are capped (2000 tree nodes, 20 sampled files, 50 codemap files) and flagged `truncated`.

## 5. Open questions / risks

- **LLM provider (confirmed from code):** synthesis runs through **OpenRouter** (`baseURL: https://openrouter.ai/api/v1`, `OPENROUTER_API_KEY`) using the model **`anthropic/claude-sonnet-4-5`** — i.e. a Claude (Anthropic) model served via OpenRouter, *not* the Anthropic API directly. Open question: stay on OpenRouter routing or call Anthropic directly for cost/latency/observability control.
- **Private-repo auth:** ingestion is public-repo-first; supporting private repos needs a real GitHub App/OAuth flow, which is also the natural path to commit-back and real user identity (replacing `demo-user`).
- **Cost & accuracy at scale:** synthesis is capped at 4000 max tokens and ~50 files of context — fine for small repos, but accuracy degrades on large/polyrepo codebases where the directory heuristic and truncation lose real structure.
- **Hallucination / trust:** the prompt forbids fabricated modules and there's Mermaid validation + fallback, but there's no automated check that the prose overview is faithful to the code. Wrong-but-confident architecture docs erode trust fastest.
- **Staleness lifecycle:** `stale` and `headSha` exist but nothing computes drift or re-runs sections. "Living document" is the promise; today it's a point-in-time snapshot. Needs a refresh/webhook story.
- **Large-repo truncation UX:** `truncated` is captured but how it's communicated to the user (and whether the doc is trustworthy when true) is unresolved.
