import OpenAI from 'openai'
import { Codemap } from './codemap'

const SYNTH_PROMPT = `You are an expert software architect. Given a structured codemap JSON of a repository, generate an ARCHITECTURE.md document in JSON format.

Return ONLY valid JSON with this structure:
{
  "title": "repo-name",
  "overview": "# repo-name\\n\\n[2-3 paragraph prose overview of the repository's purpose and architecture]",
  "module_map": "## Module Map\\n\\n[Markdown table with columns: Module | Path | Language | Responsibility, then a ### Dependencies section listing edges]",
  "diagram": "[Valid Mermaid flowchart TD syntax using only node IDs from the codemap modules. Start with 'flowchart TD']",
  "codemap": "## Codemap Index\\n\\n[Markdown table with columns: Path | Responsibility | Key Files, one row per module]"
}

CRITICAL RULES:
- Only use module IDs that exist in the input codemap
- Mermaid diagram nodes must use IDs from modules[].id only
- Keep overview prose concise (under 400 words)
- Do not fabricate modules, files, or paths not in the input`

export async function synthesizeArchitecture(repoName: string, codemap: Codemap) {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not set')

  const client = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey,
  })

  const codemapJson = JSON.stringify({
    repoName,
    modules: codemap.modules,
    files: codemap.files.slice(0, 50),
    edges: codemap.edges,
    entrypoints: codemap.entrypoints,
    languages: codemap.languages,
  }, null, 2)

  const res = await client.chat.completions.create({
    model: 'anthropic/claude-sonnet-4-5',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYNTH_PROMPT },
      { role: 'user', content: codemapJson },
    ],
    max_tokens: 4000,
  })

  const content = res.choices[0]?.message?.content || '{}'
  const parsed = JSON.parse(content)
  return {
    title: parsed.title || repoName,
    overview: parsed.overview || `# ${repoName}\n\nNo overview generated.`,
    module_map: parsed.module_map || '## Module Map\n\nNo modules detected.',
    diagram: parsed.diagram || `flowchart TD\n  root["${repoName}"]`,
    codemap: parsed.codemap || '## Codemap Index\n\nNo entries.',
  }
}

export function validateMermaid(source: string, modules: { id: string; path: string }[]): string {
  // Basic validation: check it starts with flowchart or graph
  if (!source.trim().match(/^(flowchart|graph)\s/)) {
    return buildFallbackMermaid(modules, [])
  }

  return source
}

export function buildFallbackMermaid(modules: { id: string; path: string }[], edges: { from: string; to: string }[]): string {
  const lines = ['flowchart TD']
  for (const mod of modules.slice(0, 10)) {
    const label = mod.path.replace(/['"]/g, '')
    lines.push(`  ${mod.id}["${label}"]`)
  }
  for (const edge of edges.slice(0, 20)) {
    lines.push(`  ${edge.from} --> ${edge.to}`)
  }
  return lines.join('\n')
}
