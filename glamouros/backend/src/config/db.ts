import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

let pool: Pool | null = null
let isMock = false

if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    })
    console.log('⚡ PostgreSQL Database Pool bound to Supabase.')
  } catch (err) {
    console.error('⚠️ Supabase connection error. Fallback to Memory Roster Sandbox active.', err)
    isMock = true
  }
} else {
  console.log('🤖 DATABASE_URL not found. Fallback to automated High-Fidelity Memory Roster active.')
  isMock = true
}

export { pool, isMock }
export default pool
