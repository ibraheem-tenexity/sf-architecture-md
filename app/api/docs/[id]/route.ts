import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const DEMO_USER_ID = 'demo-user'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const doc = await prisma.document.findFirst({
    where: { id, userId: DEMO_USER_ID },
    include: {
      sections: { orderBy: { position: 'asc' } },
    },
  })
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ doc })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.document.delete({ where: { id, userId: DEMO_USER_ID } }).catch(() => {})
  return NextResponse.json({ ok: true })
}
