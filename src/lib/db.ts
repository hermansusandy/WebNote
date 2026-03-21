import { Pool } from 'pg'

const globalForPool = globalThis as unknown as { __webnotePool?: Pool }

function getPool() {
    if (globalForPool.__webnotePool) return globalForPool.__webnotePool
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
        throw new Error('Missing DATABASE_URL env var')
    }
    globalForPool.__webnotePool = new Pool({ connectionString })
    return globalForPool.__webnotePool
}

export async function dbQuery<T = unknown>(text: string, params: unknown[] = []) {
    const pool = getPool()
    const result = await pool.query(text, params)
    return result.rows as T[]
}
