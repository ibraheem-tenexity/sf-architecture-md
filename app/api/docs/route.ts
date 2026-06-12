import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const DEMO_USER_ID = 'demo-user'

export async function GET() {
  const docs = await prisma.document.findMany({
    where: { userId: DEMO_USER_ID },
    orderBy: { updatedAt: 'desc' },
    select: { id: true, title: true, repoUrl: true, status: true, updatedAt: true },
    take: 50,
  })
  return NextResponse.json({ docs })
}
