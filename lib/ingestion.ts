import { Octokit } from '@octokit/rest'

const MAX_NODES = 2000
const MAX_FILE_BYTES = 50_000
const SAMPLE_FILES = ['README.md', 'package.json', 'go.mod', 'Cargo.toml', 'pyproject.toml', 'main.ts', 'main.py', 'main.go', 'index.ts', 'index.js', 'app.ts', 'app.py']

function parseRepoUrl(url: string): { owner: string; repo: string } {
  const m = url.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:[/?#].*)?$/)
  if (!m) throw new Error(`Invalid GitHub URL: ${url}`)
  return { owner: m[1], repo: m[2] }
}

export async function ingestRepo(repoUrl: string) {
  const { owner, repo } = parseRepoUrl(repoUrl)

  const token = process.env.GITHUB_TOKEN
  const octokit = new Octokit({ auth: token || undefined })

  // Get default branch
  let defaultBranch = 'main'
  let headSha = ''

  try {
    const repoData = await octokit.repos.get({ owner, repo })
    defaultBranch = repoData.data.default_branch

    const ref = await octokit.git.getRef({ owner, repo, ref: `heads/${defaultBranch}` })
    headSha = ref.data.object.sha

    // Fetch recursive tree
    const treeData = await octokit.git.getTree({ owner, repo, tree_sha: headSha, recursive: '1' })
    const truncated = treeData.data.truncated ?? false

    const allFiles = (treeData.data.tree || [])
      .filter(f => f.type === 'blob')
      .slice(0, MAX_NODES)
      .map(f => f.path!)

    // Sample high-signal files
    const sampledContent: Record<string, string> = {}
    const highSignal = allFiles.filter(f => {
      const base = f.split('/').pop() || ''
      return SAMPLE_FILES.some(s => base.toLowerCase() === s.toLowerCase()) || f === 'README.md'
    }).slice(0, 20)

    for (const path of highSignal) {
      try {
        const content = await octokit.repos.getContent({ owner, repo, path })
        if ('content' in content.data && typeof content.data.content === 'string') {
          const decoded = Buffer.from(content.data.content, 'base64').toString('utf-8')
          if (decoded.length <= MAX_FILE_BYTES) {
            sampledContent[path] = decoded
          }
        }
      } catch { /* skip */ }
    }

    return { owner, repo, defaultBranch, headSha, files: allFiles, sampledContent, truncated }
  } catch (err: unknown) {
    // If GitHub API fails (no token, private repo, etc.), fall back to minimal data
    const error = err as { status?: number; message?: string }
    if (error.status === 404) throw new Error('Repository not found or is private')
    if (error.status === 403) throw new Error('GitHub API rate limit exceeded. Try again later.')
    throw new Error(`GitHub ingestion failed: ${error.message || 'unknown error'}`)
  }
}
