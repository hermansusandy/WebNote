import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { readSessionToken } from '@/lib/session'
import { dbQuery } from '@/lib/db'

export async function GET() {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value
    if (!token) return NextResponse.json({ user: null })

    const session = await readSessionToken(token)
    if (!session) return NextResponse.json({ user: null })

    const rows = await dbQuery<{ id: string; email: string }>('select id, email from users where id = $1', [
        session.userId,
    ])
    const user = rows[0] || null
    return NextResponse.json({ user })
}
