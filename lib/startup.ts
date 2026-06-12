import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
let initialized = false

export async function ensureDbInitialized() {
  if (initialized) return
  initialized = true

  const dbUrl = process.env.DATABASE_URL || 'file:./dev.db'

  try {
    await execAsync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: dbUrl }
    })
  } catch {
    try {
      await execAsync('npx prisma db push --skip-generate --accept-data-loss', {
        env: { ...process.env, DATABASE_URL: dbUrl }
      })
    } catch (e2) {
      console.error('DB init failed:', e2)
    }
  }
}
