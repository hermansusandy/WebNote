import { NextResponse } from 'next/server'
import { dbQuery } from '@/lib/db'
import { verifyPassword } from '@/lib/password'
import { createSessionToken } from '@/lib/session'

export async function POST(req: Request) {
    const { email, password } = await req.json().catch(() => ({}))
    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
        return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const rows = await dbQuery<{ id: string; email: string; password_hash: string }>(
        'select id, email, password_hash from users where email = $1 limit 1',
        [email.toLowerCase()]
    )
    const user = rows[0]
    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    const ok = verifyPassword(password, user.password_hash)
    if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    const token = await createSessionToken({
        userId: user.id,
        expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30,
    })

    const res = NextResponse.json({ user: { id: user.id, email: user.email } })
    res.cookies.set('session', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
    })
    return res
}
