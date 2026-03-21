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
        `select lt.*, lc.name as category_name, lc.color as category_color
         from learning_titles lt
         left join learning_categories lc on lc.id = lt.category_id
         where lt.user_id = $1
         order by lt.created_at desc`,
        [userId]
    )
    return NextResponse.json({ items: rows.map(mapRow) })
}

export async function POST(req: Request) {
    const userId = await requireUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const title = typeof body.title === 'string' && body.title.trim() ? body.title.trim() : 'New Learning Goal'
    const priority = typeof body.priority === 'string' ? body.priority : 'Medium'
    const status = typeof body.status === 'string' ? body.status : 'Planned'
    const categoryId = typeof body.category_id === 'string' ? body.category_id : null

    const rows = await dbQuery<any>(
        `insert into learning_titles (user_id, title, priority, status, category_id, created_at, updated_at)
         values ($1, $2, $3, $4, $5, now(), now())
         returning *`,
        [userId, title, priority, status, categoryId]
    )
    const item = rows[0]
    if (!item.category_id) return NextResponse.json({ item })

    const cats = await dbQuery<any>('select id, name, color from learning_categories where id = $1 and user_id = $2', [
        item.category_id,
        userId,
    ])
    return NextResponse.json({ item: { ...item, category: cats[0] || null } }, { status: 201 })
}

export async function PATCH(req: Request) {
    const userId = await requireUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const ids = Array.isArray(body.ids) ? body.ids.filter((x: any) => typeof x === 'string') : []
    const updates = typeof body.updates === 'object' && body.updates ? body.updates : {}
    if (!ids.length) return NextResponse.json({ error: 'Invalid ids' }, { status: 400 })

    const fields: string[] = []
    const params: any[] = []
    let idx = 1

    const allowed = ['status', 'priority', 'category_id', 'title', 'notes']
    for (const key of allowed) {
        if (key in updates) {
            fields.push(`${key} = $${idx++}`)
            params.push(updates[key])
        }
    }
    if (!fields.length) return NextResponse.json({ error: 'No updates' }, { status: 400 })
    fields.push(`updated_at = now()`)

    params.push(userId)
    params.push(ids)
    await dbQuery(
        `update learning_titles set ${fields.join(', ')} where user_id = $${idx++} and id = any($${idx}::uuid[])`,
        params
    )

    return NextResponse.json({ ok: true })
}
