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
        `select r.*, rc.name as category_name, rc.color as category_color
         from reminders r
         left join reminder_categories rc on rc.id = r.category_id
         where r.user_id = $1
         order by r.due_at asc nulls last`,
        [userId]
    )
    return NextResponse.json({ items: rows.map(mapRow) })
}

export async function POST(req: Request) {
    const userId = await requireUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const title = typeof body.title === 'string' && body.title.trim() ? body.title.trim() : 'New Reminder'
    const dueAt = typeof body.due_at === 'string' ? body.due_at : null
    const priority = typeof body.priority === 'string' ? body.priority : 'Medium'
    const categoryId = typeof body.category_id === 'string' ? body.category_id : null

    const rows = await dbQuery<any>(
        `insert into reminders (user_id, title, due_at, priority, category_id, created_at, updated_at)
         values ($1, $2, $3, $4, $5, now(), now())
         returning *`,
        [userId, title, dueAt, priority, categoryId]
    )
    return NextResponse.json({ item: rows[0] }, { status: 201 })
}

export async function DELETE(req: Request) {
    const userId = await requireUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const ids = Array.isArray(body.ids) ? body.ids.filter((x: any) => typeof x === 'string') : []
    if (!ids.length) return NextResponse.json({ error: 'Invalid ids' }, { status: 400 })

    await dbQuery('delete from reminders where user_id = $1 and id = any($2::uuid[])', [userId, ids])
    return NextResponse.json({ ok: true })
}
