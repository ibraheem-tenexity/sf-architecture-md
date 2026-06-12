import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function initDb() {
  try {
    await execAsync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db' }
    })
  } catch (e) {
    // Migration may fail in some envs; try db push as fallback
    await execAsync('npx prisma db push --skip-generate', {
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db' }
    })
  }
}
