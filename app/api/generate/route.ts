import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SAMPLE_REPO_URL, SAMPLE_CODEMAP, SAMPLE_SECTIONS } from '@/lib/sample-repo'
import { ingestRepo } from '@/lib/ingestion'
import { buildCodemap } from '@/lib/codemap'
import { synthesizeArchitecture, validateMermaid, buildFallbackMermaid } from '@/lib/synthesis'
import { ensureDbInitialized } from '@/lib/startup'

const DEMO_USER_ID = 'demo-user'

export async function POST(req: NextRequest) {
  await ensureDbInitialized()

  const { repoUrl } = await req.json()
  if (!repoUrl || typeof repoUrl !== 'string') {
    return NextResponse.json({ error: 'repoUrl is required' }, { status: 400 })
  }

  // Parse repo name for title
  const repoMatch = repoUrl.match(/github\.com\/[^/]+\/([^/?#]+)/)
  const repoName = repoMatch ? repoMatch[1].replace(/\.git$/, '') : 'unknown-repo'

  // Create document row with 'generating' status
  const doc = await prisma.document.create({
    data: {
      userId: DEMO_USER_ID,
      repoUrl: repoUrl.trim(),
      repoOwner: repoUrl.match(/github\.com\/([^/]+)/)?.[1] || '',
      repoName,
      title: repoName,
      status: 'generating',
    },
  })

  // Run generation asynchronously (fire-and-forget) so we can return the doc ID immediately
  runGeneration(doc.id, repoUrl.trim(), repoName).catch(err => {
    console.error('Generation failed:', err)
    prisma.document.update({
      where: { id: doc.id },
      data: { status: 'failed' },
    }).catch(() => {})
  })

  return NextResponse.json({ id: doc.id })
}

async function runGeneration(docId: string, repoUrl: string, repoName: string) {
  try {
    let codemap: typeof SAMPLE_CODEMAP
    let owner = ''
    let defaultBranch = 'main'
    let headSha = ''
    let truncated = false

    if (repoUrl === SAMPLE_REPO_URL || repoUrl.includes('sample/architecture-demo')) {
      // MOCK: use pre-baked sample data
      codemap = SAMPLE_CODEMAP
      owner = 'sample'
      defaultBranch = 'main'
      headSha = 'abc123'
      truncated = false
    } else {
      // Real ingestion
      const ingested = await ingestRepo(repoUrl)
      owner = ingested.owner
      defaultBranch = ingested.defaultBranch
      headSha = ingested.headSha
      truncated = ingested.truncated
      codemap = buildCodemap(ingested.files, ingested.sampledContent, truncated)
    }

    // Synthesis
    let sections: typeof SAMPLE_SECTIONS

    if (repoUrl === SAMPLE_REPO_URL || repoUrl.includes('sample/architecture-demo')) {
      sections = SAMPLE_SECTIONS
    } else {
      try {
        const synth = await synthesizeArchitecture(repoName, codemap)
        const mermaidSource = validateMermaid(synth.diagram, codemap.modules)
        sections = {
          overview: synth.overview,
          module_map: synth.module_map,
          diagram: mermaidSource,
          codemap: synth.codemap,
        }
      } catch {
        // Fallback: use codemap to build basic sections
        const fallbackDiagram = buildFallbackMermaid(codemap.modules, codemap.edges)
        sections = {
          overview: `# ${repoName}\n\nArchitecture overview generation encountered an issue. The codemap below shows the detected structure.`,
          module_map: `## Module Map\n\n| Module | Path | Language |\n|---|---|---|\n${codemap.modules.map(m => `| ${m.id} | \`${m.path}\` | ${m.language} |`).join('\n')}`,
          diagram: fallbackDiagram,
          codemap: `## Codemap Index\n\n| Path | Language |\n|---|---|\n${codemap.modules.map(m => `| \`${m.path}\` | ${m.language} |`).join('\n')}`,
        }
      }
    }

    // Persist sections
    const sectionOrder = ['overview', 'module_map', 'diagram', 'codemap'] as const

    for (let i = 0; i < sectionOrder.length; i++) {
      const key = sectionOrder[i]
      await prisma.documentSection.upsert({
        where: { documentId_sectionKey: { documentId: docId, sectionKey: key } },
        create: {
          documentId: docId,
          sectionKey: key,
          contentMd: sections[key],
          position: i,
          aiGenerated: true,
        },
        update: {
          contentMd: sections[key],
          aiGenerated: true,
        },
      })
    }

    // Update document to ready
    await prisma.document.update({
      where: { id: docId },
      data: {
        status: 'ready',
        repoOwner: owner,
        defaultBranch,
        headSha,
        truncated,
        mermaid: sections.diagram,
        codemap: JSON.stringify(codemap),
        updatedAt: new Date(),
      },
    })
  } catch (err: unknown) {
    const error = err as { message?: string }
    await prisma.document.update({
      where: { id: docId },
      data: {
        status: 'failed',
        codemap: JSON.stringify({ error: error.message || 'Generation failed' }),
      },
    }).catch(() => {})
    throw err
  }
}
