interface CodemapModule {
  id: string
  path: string
  language: string
  responsibility: string
}

interface CodemapFile {
  path: string
  module: string
  isEntrypoint: boolean
}

interface CodemapEdge {
  from: string
  to: string
}

export interface Codemap {
  modules: CodemapModule[]
  files: CodemapFile[]
  edges: CodemapEdge[]
  entrypoints: string[]
  languages: string[]
  truncated: boolean
}

const ENTRYPOINT_NAMES = new Set(['main', 'index', 'app', 'server', 'cli'])
const LANG_MAP: Record<string, string> = {
  ts: 'TypeScript', tsx: 'TypeScript', js: 'JavaScript', jsx: 'JavaScript',
  py: 'Python', go: 'Go', rs: 'Rust', java: 'Java', kt: 'Kotlin',
  rb: 'Ruby', php: 'PHP', cs: 'C#', cpp: 'C++', c: 'C',
  css: 'CSS', scss: 'SCSS', html: 'HTML', md: 'Markdown',
  json: 'JSON', yaml: 'YAML', yml: 'YAML', toml: 'TOML',
}

function detectLanguage(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() || ''
  return LANG_MAP[ext] || 'Unknown'
}

function groupModule(file: string): string {
  const parts = file.split('/')
  return parts.length > 1 ? parts[0] : 'root'
}

export function buildCodemap(files: string[], sampledContent: Record<string, string>, truncated: boolean): Codemap {
  // Group files by top-level directory
  const moduleGroups: Record<string, string[]> = {}
  for (const f of files) {
    const mod = groupModule(f)
    if (!moduleGroups[mod]) moduleGroups[mod] = []
    moduleGroups[mod].push(f)
  }

  // Detect dominant language per module
  const modules: CodemapModule[] = Object.entries(moduleGroups).slice(0, 20).map(([id, modFiles]) => {
    const langs: Record<string, number> = {}
    for (const f of modFiles) {
      const l = detectLanguage(f)
      langs[l] = (langs[l] || 0) + 1
    }
    const domLang = Object.entries(langs).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown'
    return { id, path: id, language: domLang, responsibility: `${id} module` }
  })

  // Build file list
  const codemapFiles: CodemapFile[] = files.slice(0, 100).map(f => {
    const base = f.split('/').pop()?.split('.')[0] || ''
    const isEntrypoint = ENTRYPOINT_NAMES.has(base.toLowerCase())
    return { path: f, module: groupModule(f), isEntrypoint }
  })

  // Detect edges from import statements
  const edges: CodemapEdge[] = []
  for (const [path, content] of Object.entries(sampledContent)) {
    const fromMod = groupModule(path)
    const imports = content.match(/from ['"]\.\.?\/([^'"]+)['"]/g) || []
    const seenEdges = new Set<string>()
    for (const imp of imports) {
      const m = imp.match(/from ['"]\.\.?\/([^/'"]+)/)
      if (m) {
        const toMod = m[1]
        const key = `${fromMod}->${toMod}`
        if (fromMod !== toMod && !seenEdges.has(key) && moduleGroups[toMod]) {
          edges.push({ from: fromMod, to: toMod })
          seenEdges.add(key)
        }
      }
    }
  }

  const entrypoints = codemapFiles.filter(f => f.isEntrypoint).map(f => f.path).slice(0, 10)
  const languages = [...new Set(modules.map(m => m.language).filter(l => l !== 'Unknown'))]

  return { modules, files: codemapFiles, edges, entrypoints, languages, truncated }
}
