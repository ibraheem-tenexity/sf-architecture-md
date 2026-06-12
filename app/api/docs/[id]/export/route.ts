import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const DEMO_USER_ID = 'demo-user'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const doc = await prisma.document.findFirst({
    where: { id, userId: DEMO_USER_ID },
    include: { sections: { orderBy: { position: 'asc' } } },
  })
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const sectionMap: Record<string, string> = {}
  for (const s of doc.sections) {
    sectionMap[s.sectionKey] = s.contentMd
  }

  const overview = sectionMap['overview'] || ''
  const moduleMap = sectionMap['module_map'] || ''
  const codemap = sectionMap['codemap'] || ''
  const diagram = sectionMap['diagram'] || doc.mermaid || ''

  const markdown = [
    `# ${doc.title}`,
    '',
    overview.replace(/^# [^\n]+\n/, ''),
    '',
    moduleMap,
    '',
    '## System Diagram',
    '',
    '```mermaid',
    diagram,
    '```',
    '',
    codemap,
  ].join('\n')

  return NextResponse.json({ markdown, title: doc.title })
}
