import { NextResponse } from 'next/server'
import { dbQuery } from '@/lib/db'
import { hashPassword } from '@/lib/password'
import { createSessionToken } from '@/lib/session'

export async function POST(req: Request) {
    const { email, password } = await req.json().catch(() => ({}))
    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
        return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const passwordHash = hashPassword(password)

    try {
        const rows = await dbQuery<{ id: string; email: string }>(
            'insert into users (email, password_hash) values ($1, $2) returning id, email',
            [email.toLowerCase(), passwordHash]
        )
        const user = rows[0]
        const token = await createSessionToken({
            userId: user.id,
            expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30,
        })

        const res = NextResponse.json({ user }, { status: 201 })
        res.cookies.set('session', token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 24 * 30,
        })
        return res
    } catch (e: any) {
        const message = typeof e?.message === 'string' ? e.message : 'Failed'
        if (message.includes('duplicate key') || message.includes('users_email_key')) {
            return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
        }
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }
}
