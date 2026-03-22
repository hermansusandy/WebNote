import { NextResponse } from 'next/server'
import { requireUserId } from '@/lib/auth'
import { dbQuery } from '@/lib/db'

function mapRow(row: any) {
    const category = row.category_id
        ? { id: row.category_id, name: row.category_name, color: row.category_color }
        : null
    const { category_name, category_color, ...rest } = row
    return { ...rest, category }
}

export async function GET() {
    const userId = await requireUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const rows = await dbQuery<any>(
        `select yi.*, yc.name as category_name, yc.color as category_color
         from youtube_items yi
         left join youtube_categories yc on yc.id = yi.category_id
         where yi.user_id = $1
         order by yi.created_at desc`,
        [userId]
    )
    return NextResponse.json({ items: rows.map(mapRow) })
}

export async function POST(req: Request) {
    const userId = await requireUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const name = typeof body.name === 'string' && body.name.trim() ? body.name.trim() : 'New Youtube Video'
    const url = typeof body.url === 'string' ? body.url : ''
    const note = typeof body.note === 'string' ? body.note : ''
    const categoryId = typeof body.category_id === 'string' ? body.category_id : null

    const rows = await dbQuery<any>(
        `insert into youtube_items (user_id, category_id, name, url, note, created_at, updated_at)
         values ($1, $2, $3, $4, $5, now(), now())
         returning *`,
        [userId, categoryId, name, url, note]
    )
    return NextResponse.json({ item: rows[0] }, { status: 201 })
}

export async function DELETE(req: Request) {
    const userId = await requireUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const ids = Array.isArray(body.ids) ? body.ids.filter((x: any) => typeof x === 'string') : []
    if (!ids.length) return NextResponse.json({ error: 'Invalid ids' }, { status: 400 })

    await dbQuery('delete from youtube_items where user_id = $1 and id = any($2::uuid[])', [userId, ids])
    return NextResponse.json({ ok: true })
}
