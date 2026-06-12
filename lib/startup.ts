import { prisma } from './prisma'

let initialized = false

export async function ensureDbInitialized() {
  if (initialized) return
  initialized = true

  try {
    // Create tables if they don't exist (safe for SQLite)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Document" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL DEFAULT 'demo-user',
        "repoUrl" TEXT NOT NULL,
        "repoOwner" TEXT NOT NULL,
        "repoName" TEXT NOT NULL,
        "defaultBranch" TEXT NOT NULL DEFAULT 'main',
        "headSha" TEXT NOT NULL DEFAULT '',
        "title" TEXT NOT NULL,
        "mermaid" TEXT NOT NULL DEFAULT '',
        "status" TEXT NOT NULL DEFAULT 'generating',
        "truncated" BOOLEAN NOT NULL DEFAULT false,
        "codemap" TEXT NOT NULL DEFAULT '{}',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "DocumentSection" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "documentId" TEXT NOT NULL,
        "sectionKey" TEXT NOT NULL,
        "contentMd" TEXT NOT NULL DEFAULT '',
        "position" INTEGER NOT NULL DEFAULT 0,
        "aiGenerated" BOOLEAN NOT NULL DEFAULT true,
        "stale" BOOLEAN NOT NULL DEFAULT false,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("documentId") REFERENCES "Document" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `)

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "DocumentSection_documentId_sectionKey_key"
      ON "DocumentSection"("documentId", "sectionKey")
    `)

    console.log('DB initialized successfully')
  } catch (err) {
    console.error('DB init error (may be ok if tables already exist):', err)
  }
}
