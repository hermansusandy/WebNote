import { NextResponse } from 'next/server'
import { requireUserId } from '@/lib/auth'
import { dbQuery } from '@/lib/db'

export async function GET(req: Request) {
    const userId = await requireUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const url = new URL(req.url)
    const parentId = url.searchParams.get('parentId')

    const rows = await dbQuery<{ id: string; title: string; icon: string | null; parent_id: string | null }>(
        parentId
            ? 'select id, title, icon, parent_id from pages where user_id = $1 and parent_id = $2 order by sort_order asc'
            : 'select id, title, icon, parent_id from pages where user_id = $1 and parent_id is null order by sort_order asc',
        parentId ? [userId, parentId] : [userId]
    )

    return NextResponse.json({ pages: rows })
}

export async function POST(req: Request) {
    const userId = await requireUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { title, parent_id } = await req.json().catch(() => ({}))
    const safeTitle = typeof title === 'string' && title.trim() ? title.trim() : 'Untitled Page'
    const parentId = typeof parent_id === 'string' ? parent_id : null

    const rows = await dbQuery<{ id: string; title: string }>(
        'insert into pages (user_id, title, parent_id, updated_at) values ($1, $2, $3, now()) returning id, title',
        [userId, safeTitle, parentId]
    )
    return NextResponse.json({ page: rows[0] }, { status: 201 })
}
