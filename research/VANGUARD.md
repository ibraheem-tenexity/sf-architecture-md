# VANGUARD — Competitive Landscape & Solution Paths

_Stage 1 research for **architecture.md** — a web app that connects a public GitHub repo and auto-generates a living, per-section-editable, repo-committable `ARCHITECTURE.md` (prose overview + module map + rendered Mermaid + codemap index)._

_Date: 2026-06-12. All URLs below were verified via WebSearch/WebFetch during this research pass._

---

## Competitor landscape

The space splits into four clusters: (1) **AI repo-wiki generators** (closest competitors), (2) **diagram-from-repo tools**, (3) **living-docs / onboarding platforms**, and (4) **code-comprehension / chat tools**. architecture.md sits at the intersection of (1) and (2) but with a distinct "single committed Markdown artifact" thesis.

### Direct competitors — AI repo → docs/wiki generators

**DeepWiki (by Cognition / Devin)** — https://deepwiki.com/
- Free for public repos; swap `github.com` → `deepwiki.com/<owner>/<repo>` and it auto-indexes.
- Produces architecture diagrams, module/concept explanations, source-linked summaries, plus a conversational "Ask Devin" Q&A grounded in the code. Steerable via `.devin/wiki.json` (repo notes, page hierarchy; 30-page cap, 80 for enterprise). Official MCP server exposes wiki + ask endpoints.
- **Gap vs architecture.md:** It's a hosted wiki site, not a file you own. Confirmed via docs fetch: **no per-section editing, no Markdown export, no commit-back-to-repo**. The artifact lives on Cognition's servers, not in your tree, so it can't be diffed, reviewed in a PR, or rendered natively by GitHub. It's a destination, not a living `ARCHITECTURE.md`.

**GitDiagram** — https://gitdiagram.com/
- Free, open-source (~15.7k GitHub stars), swap `github.com` → `gitdiagram.com`. Built on Claude Sonnet via a two-pass pipeline (prose explanation → structured graph), rendering **Mermaid** diagrams; clickable nodes deep-link to files/dirs. Supports private repos with an API key.
- **Gap:** Diagram-only — no prose architecture document, no module map index, no per-section editing, and no Markdown export to commit. It's the "diagram" slice of architecture.md's output with none of the document, persistence, or editing layers.
- Source/repo: https://github.com/ahmedkhaleel2004/gitdiagram

**Swimm** — https://swimm.io/
- **Important pivot (verified via homepage fetch):** Swimm has repositioned from "docs coupled to code" into a **code-modernization platform** (API-first refactoring, large-scale .NET/Java/mainframe migrations, an "agentic context layer" for Claude Code / Copilot). It still does deterministic static analysis — dependency maps, data flows, dead code, architecture maps — but outputs now live in their workspace and are queried via MCP, with stage-based fixed pricing.
- **Gap:** No longer a lightweight self-serve "generate an architecture doc for my repo" product; it's an enterprise services/migration engagement. Output is a queryable knowledge base, not a committed Markdown file. Heavy, sales-led, not OSS-friendly.

**CodeSee → GitKraken (defunct as standalone)** — https://www.codesee.io/ (legacy) / https://www.gitkraken.com/
- CodeSee did auto-generated codebase maps and "living documentation" / onboarding visualizations. **Confirmed defunct as an independent product:** announced shutdown Feb 22 2024, then acquired by GitKraken (May 14 2024); capabilities folded into GitKraken's tooling.
- **Gap / signal:** The canonical "living architecture visualization" startup died as a standalone. Lesson: visualization alone (without a durable, ownable artifact and a clear daily-use loop) was not a sustainable wedge. architecture.md should not repeat the "pretty map, no home" mistake.

### Adjacent — diagram / static-analysis from source

**Swark** — https://github.com/swark-io/swark
- VS Code extension; LLM-generated **Mermaid** architecture diagrams from your code, token-budget-aware prompt assembly. Open source.
- **Gap:** IDE-only, diagram-only, no prose doc, no module index, no committed artifact, no Q&A. A feature, not a document.

**Mermaid / Mermaid Chart** — https://www.mermaidchart.com/ (and VS Code ext: https://github.com/Mermaid-Chart/vscode-mermaid-chart)
- The rendering substrate architecture.md depends on. Mermaid Chart adds an editor, AI-assisted diagramming, and dependency-diagram features.
- **Gap:** A diagramming tool/standard, not a repo-comprehension product. It renders what you give it; it doesn't understand or document a codebase. Complementary, not competitive (architecture.md emits Mermaid that GitHub renders natively).

**CodeScene** — https://codescene.com/
- **Behavioral** code analysis: hotspots from VCS history, change-coupling (hidden dependencies / architectural risk), code-health metrics, 25+ code smells across 30+ languages, bus-factor/knowledge maps, PR & CI integration.
- **Gap:** Risk/quality intelligence, not an explanatory architecture document. Outputs dashboards and metrics, not a prose-plus-diagram `ARCHITECTURE.md` a newcomer reads top-to-bottom. Different job-to-be-done; potential v2 data source rather than competitor.

### Adjacent — code comprehension / chat & repo-map

**Sourcegraph Cody** — https://sourcegraph.com/docs/cody
- Whole-codebase context via Sourcegraph's code graph + embeddings; chat, inline edits, doc/test generation, multi-LLM (BYOM), enterprise security. **Enterprise-only as of mid-2025** (Free/Pro/Enterprise-Starter tiers discontinued).
- **Gap:** An IDE coding assistant with code search, not a generator of a standalone architecture document. No single committed artifact; gated behind enterprise. Comprehension happens in-session, ephemerally.

**Aider — repo-map (tree-sitter)** — https://aider.chat/docs/repomap.html
- The reference implementation of "deeper static analysis feeding an LLM": tree-sitter ASTs across **130+ languages**, a file-dependency graph ranked by PageRank, token-budgeted to fit context. Powers Aider's coding agent.
- **Gap:** It's a *context-feeding technique inside a coding tool*, not a product that emits a human-readable architecture doc. **Most relevant as an engineering blueprint for architecture.md's v2 engine**, not as a competitor.

**Mintlify** — https://mintlify.com/
- Docs **hosting/authoring** platform with an AI "context-aware agent" that drafts/maintains content; supports `llms.txt` and MCP.
- **Gap (verified via homepage fetch):** Does **not** auto-generate architecture from source code or build diagrams from a repo. It's where polished docs are published and maintained, not where they're synthesized from code. Possible downstream publishing target, not a competitor to the generation engine.

### Other tools worth noting (lower-priority)
- **DOSU / Driver.ai / Workik / RepoDoc AI** (https://repodoc-ai.dev/) and OSS scripts (ai-doc-gen: https://github.com/divar-ir/ai-doc-gen) — a crowded long tail of "repo → docs" LLM wrappers. Most produce README/BRD/TRD-style prose without a rendered module map, editable sections, or a committed-artifact workflow.
- **Doxygen / Structurizr (C4) / code2flow** — deterministic, comment- or DSL-driven generators. High accuracy, zero hallucination, but require manual upkeep (Doxygen comments, Structurizr DSL) — exactly the rot problem architecture.md attacks. No LLM prose synthesis.
- **Sourcetrail** — interactive source explorer; **discontinued/archived** (open-sourced then abandoned). Another "visualization-only died" data point.

---

## Where architecture.md wins

The defensible wedge is **the artifact + the workflow**, not the generation (everyone can prompt an LLM over a repo). Concretely:

- **The output is a file you own, in your repo.** A committed `ARCHITECTURE.md` is diff-able, PR-reviewable, version-controlled, and rendered **natively by GitHub** (Mermaid included). Every direct competitor (DeepWiki, GitDiagram, Swimm) keeps the artifact on *their* platform. "It lives in your tree" is the moat — and the only durable answer to the "living docs" promise.
- **Per-section editing closes the trust gap.** LLM output is never 100% right; the killer feature is letting a human correct one section (and only regenerate that section) instead of accepting or discarding a whole hosted wiki. None of DeepWiki/GitDiagram/Swark expose this.
- **One coherent artifact, four views in one place** — prose overview + module map + rendered Mermaid + codemap index. Competitors deliver slices: GitDiagram = diagram only, Mintlify = hosting only, CodeScene = metrics only, DeepWiki = hosted wiki only. architecture.md is the assembled, readable, single-page document a new engineer actually reads.
- **Anti-rot regeneration as the core loop.** Regenerate-on-change (CI/PR hook) targeting a *committed* file is a story DeepWiki (hosted) and Doxygen/Structurizr (manual upkeep) can't tell cleanly. This is the recurring-value engine — and CodeSee's death shows visualization without this loop doesn't last.
- **Frictionless + OSS-friendly.** Public-repo, paste-a-URL, free-to-try positioning (like DeepWiki/GitDiagram) avoids Swimm's sales-led / Cody's enterprise-gated friction — the right shape for OSS maintainers and engineers inheriting repos.

---

## Solution paths

The core engine = turn a repo into an accurate module map + edges + prose. Three candidate architectures:

### (a) Heuristic codemap + LLM synthesis — *current prototype*
Directory-grouping for modules + import-regex for edges, then LLM writes prose/diagram.
- **Accuracy:** Low–medium. Regex import edges miss dynamic imports, re-exports, aliases, DI, monorepo path mapping; directory ≠ architectural module. Diagram fidelity is only as good as the noisy graph fed in.
- **Cost/latency:** Lowest. One or two LLM passes; cheap, fast, streamable.
- **Language coverage:** Broad but shallow — regex "works" everywhere and is correct nowhere in particular. Per-language import syntax tuning required.
- **Hallucination risk:** Medium–high. Thin grounding means the LLM fills gaps by invention; the diagram can look authoritative while being wrong.
- **Effort:** Already built.

### (b) Deeper static analysis (AST / tree-sitter) feeding the LLM — *the Aider model*
tree-sitter ASTs → real symbol/def-ref graph → PageRank-ranked, token-budgeted context → LLM prose.
- **Accuracy:** High. Real definitions, references, and call/import edges. This is the proven approach (Aider, 130+ languages; CodeScene-class rigor).
- **Cost/latency:** Medium. Parsing is fast and deterministic; ranking trims tokens so the LLM pass is often *cheaper* and *less* hallucination-prone than dumping raw files.
- **Language coverage:** Excellent via tree-sitter grammars (130+), each needing a `tags.scm` query — incremental, not all-or-nothing.
- **Hallucination risk:** Low–medium. Strong grounding constrains the model to real symbols.
- **Effort:** Medium–high. tree-sitter integration, per-language tag queries, graph ranking. But it's well-trodden — Aider's repo-map is essentially open-source reference design.

### (c) Pure-LLM agentic "read the repo and write it" — *the DeepWiki/large-context model*
Large-context or agentic file-reading; let the model traverse and synthesize.
- **Accuracy:** Medium–high on small/medium repos, degrades on large ones (selective reading misses structure). Good prose, but diagram/edge precision relies on the model's own (un-grounded) graph inference.
- **Cost/latency:** Highest and least predictable — many tokens / many tool-call turns. Worst unit economics for a free public-repo product.
- **Language coverage:** Universal (no parsers needed) — its one real advantage.
- **Hallucination risk:** Highest — fewest deterministic guardrails; this is the source of "confident but wrong" architecture docs.
- **Effort:** Low-to-build, high-to-make-reliable-and-affordable at scale.

### Recommendation

**MVP: keep (a), but harden it — a pragmatic (a)→(b) hybrid.** Ship the current heuristic + LLM pipeline (it works, it's cheap, it streams), and immediately de-risk the weakest link (import-regex edges) by introducing **tree-sitter for the top languages the target users actually inherit (TS/JS, Python, Go, Java)**. Use tree-sitter only for the def/ref edge graph; keep directory-grouping for the module map and the LLM for prose. This is the highest accuracy-per-engineering-dollar move and directly attacks hallucination risk where it's worst (the diagram). Per-section editing must ship in the MVP regardless of engine — it's the trust mechanism that makes any accuracy level shippable.

**Avoid (c) as the primary engine.** Its cost/latency/hallucination profile is wrong for a free, public-repo, paste-a-URL product, and it concedes the accuracy story to grounded competitors. Reserve agentic file-reading for *targeted* gap-fill (e.g., "explain this one module the user asked to regenerate") where the cost is bounded.

**v2 direction:** Fully adopt **(b) at the core** — tree-sitter graph across the full language set + PageRank-style ranking to fit context budgets (Aider's playbook), optionally enriched with **CodeScene-style VCS signals** (hotspots, change-coupling) to rank what matters and to power the anti-rot **regenerate-on-PR** loop. Edges and module importance become deterministic; the LLM is confined to prose and labeling. That is what makes the diagram trustworthy enough to commit — the real differentiator.

---

## Risks & open questions

- **Accuracy / hallucination (top risk).** A committed, official-looking `ARCHITECTURE.md` that's subtly wrong is worse than none — it misleads the exact newcomer it targets, and erodes trust irreversibly. Mitigations: tree-sitter-grounded edges (limit LLM to prose), source-line citations per claim (DeepWiki does this), explicit "generated, verify" provenance, and per-section regenerate/edit so humans can correct without nuking the doc.
- **Cost at free-tier scale.** Public-repo / paste-a-URL invites large and abusive repos. Need token budgeting (rank + truncate, à la Aider), aggressive caching keyed on commit SHA (regenerate only changed sections), per-repo rate limits, and a hard size ceiling. Pure-LLM path (c) makes this economically dangerous.
- **Large-repo scaling.** Monorepos blow past context windows and any single diagram's legibility. Open questions: how to chunk/summarize hierarchically (per-package sub-docs?), how to keep the Mermaid diagram readable above ~30–40 nodes, and how to pick the "important" subset (PageRank/hotspots). DeepWiki caps at 30–80 pages — a signal that even Cognition bounds this.
- **Staleness / drift (the entire thesis).** "Living" only holds if regeneration is wired into the dev loop (PR/CI hook, GitHub App) and cheap enough to run per-change. Open questions: how to merge regenerated content with human per-section edits without clobbering them (3-way merge? section-level locks/`<!-- locked -->`?), and how to surface "this section is N commits stale." This merge-vs-edit tension is the hardest product problem and the thing CodeSee/Swimm never solved cleanly.
- **Defensibility.** Generation is commoditized (DeepWiki free, GitDiagram OSS, dozens of wrappers). The moat is artifact-ownership + per-section editing + the regeneration loop, not the LLM call. Risk: GitHub/Copilot or DeepWiki ships "commit this as a Markdown file" and erases the wedge overnight — so move fast on the committed-artifact + edit-merge workflow.

---

### Sources verified
- DeepWiki: https://deepwiki.com/ · https://docs.devin.ai/work-with-devin/deepwiki
- GitDiagram: https://gitdiagram.com/ · https://github.com/ahmedkhaleel2004/gitdiagram
- Swimm: https://swimm.io/
- CodeSee (defunct → GitKraken): https://www.codesee.io/ · https://www.gitkraken.com/
- Swark: https://github.com/swark-io/swark
- Mermaid Chart: https://www.mermaidchart.com/
- CodeScene: https://codescene.com/
- Sourcegraph Cody: https://sourcegraph.com/docs/cody
- Aider repo-map: https://aider.chat/docs/repomap.html
- Mintlify: https://mintlify.com/
