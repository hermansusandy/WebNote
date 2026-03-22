import { NextResponse } from 'next/server'
import { requireUserId } from '@/lib/auth'
import { dbQuery } from '@/lib/db'

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
    const userId = await requireUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await ctx.params
    const updates = await req.json().catch(() => ({}))

    const fields: string[] = []
    const params: any[] = []
    let idx = 1

    const allowed = ['name', 'url', 'note', 'category_id', 'tags']
    for (const key of allowed) {
        if (key in updates) {
            fields.push(`${key} = $${idx++}`)
            params.push(updates[key])
        }
    }
    if (!fields.length) return NextResponse.json({ error: 'No updates' }, { status: 400 })
    fields.push('updated_at = now()')

    params.push(id, userId)
    const rows = await dbQuery<any>(
        `update youtube_items set ${fields.join(', ')} where id = $${idx++} and user_id = $${idx} returning *`,
        params
    )
    if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ item: rows[0] })
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
    const userId = await requireUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await ctx.params
    await dbQuery('delete from youtube_items where id = $1 and user_id = $2', [id, userId])
    return NextResponse.json({ ok: true })
}
