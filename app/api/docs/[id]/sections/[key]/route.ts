import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const DEMO_USER_ID = 'demo-user'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; key: string }> }
) {
  const { id, key } = await params
  const { content_md } = await req.json()

  if (typeof content_md !== 'string') {
    return NextResponse.json({ error: 'content_md required' }, { status: 400 })
  }

  const doc = await prisma.document.findFirst({ where: { id, userId: DEMO_USER_ID } })
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const section = await prisma.documentSection.upsert({
    where: { documentId_sectionKey: { documentId: id, sectionKey: key } },
    create: { documentId: id, sectionKey: key, contentMd: content_md, position: 99, aiGenerated: false },
    update: { contentMd: content_md, aiGenerated: false, updatedAt: new Date() },
  })

  await prisma.document.update({ where: { id }, data: { updatedAt: new Date() } })

  return NextResponse.json({ section })
}
