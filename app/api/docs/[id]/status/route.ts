import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const DEMO_USER_ID = 'demo-user'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const doc = await prisma.document.findFirst({
    where: { id, userId: DEMO_USER_ID },
    select: { id: true, status: true },
  })
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ status: doc.status, id: doc.id })
}
