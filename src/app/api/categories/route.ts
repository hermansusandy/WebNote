import { NextResponse } from 'next/server'
import { requireUserId } from '@/lib/auth'
import { dbQuery } from '@/lib/db'

const allowedTables = new Set([
    'learning_categories',
    'reminder_categories',
    'youtube_categories',
    'web_url_categories',
    'web_url_sub_categories',
])

export async function GET(req: Request) {
    const userId = await requireUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const url = new URL(req.url)
    const table = url.searchParams.get('table') || ''
    if (!allowedTables.has(table)) return NextResponse.json({ error: 'Invalid table' }, { status: 400 })

    const rows = await dbQuery<any>(`select * from ${table} where user_id = $1 order by name asc`, [userId])
    return NextResponse.json({ items: rows })
}

export async function POST(req: Request) {
    const userId = await requireUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { table, name, color } = await req.json().catch(() => ({}))
    if (typeof table !== 'string' || !allowedTables.has(table)) {
        return NextResponse.json({ error: 'Invalid table' }, { status: 400 })
    }
    if (typeof name !== 'string' || !name.trim()) {
        return NextResponse.json({ error: 'Invalid name' }, { status: 400 })
    }

    const hasColor = table !== 'web_url_categories' && table !== 'web_url_sub_categories'
    const rows = await dbQuery<any>(
        hasColor
            ? `insert into ${table} (user_id, name, color) values ($1, $2, $3) returning *`
            : `insert into ${table} (user_id, name) values ($1, $2) returning *`,
        hasColor ? [userId, name.trim(), typeof color === 'string' ? color : null] : [userId, name.trim()]
    )
    return NextResponse.json({ item: rows[0] }, { status: 201 })
}

export async function PATCH(req: Request) {
    const userId = await requireUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { table, id, name, color } = await req.json().catch(() => ({}))
    if (typeof table !== 'string' || !allowedTables.has(table)) {
        return NextResponse.json({ error: 'Invalid table' }, { status: 400 })
    }
    if (typeof id !== 'string' || !id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    if (typeof name !== 'string' || !name.trim()) return NextResponse.json({ error: 'Invalid name' }, { status: 400 })

    const hasColor = table !== 'web_url_categories' && table !== 'web_url_sub_categories'
    const rows = await dbQuery<any>(
        hasColor
            ? `update ${table} set name = $1, color = $2 where id = $3 and user_id = $4 returning *`
            : `update ${table} set name = $1 where id = $2 and user_id = $3 returning *`,
        hasColor
            ? [name.trim(), typeof color === 'string' ? color : null, id, userId]
            : [name.trim(), id, userId]
    )
    if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ item: rows[0] })
}

export async function DELETE(req: Request) {
    const userId = await requireUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { table, id } = await req.json().catch(() => ({}))
    if (typeof table !== 'string' || !allowedTables.has(table)) {
        return NextResponse.json({ error: 'Invalid table' }, { status: 400 })
    }
    if (typeof id !== 'string' || !id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

    await dbQuery(`delete from ${table} where id = $1 and user_id = $2`, [id, userId])
    return NextResponse.json({ ok: true })
}
