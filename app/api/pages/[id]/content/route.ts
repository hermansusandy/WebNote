import { NextResponse } from 'next/server'
import { requireUserId } from '@/lib/auth'
import { dbQuery } from '@/lib/db'

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
    const userId = await requireUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id: pageId } = await ctx.params
    const { content } = await req.json().catch(() => ({}))

    const existing = await dbQuery<{ id: string }>(
        "select id from page_blocks where page_id = $1 and user_id = $2 and type = 'tiptap-doc' limit 1",
        [pageId, userId]
    )

    if (existing[0]) {
        await dbQuery('update page_blocks set content = $1, updated_at = now() where id = $2 and user_id = $3', [
            content ?? null,
            existing[0].id,
            userId,
        ])
        await dbQuery('update pages set updated_at = now() where id = $1 and user_id = $2', [pageId, userId])
        return NextResponse.json({ blockId: existing[0].id })
    }

    const rows = await dbQuery<{ id: string }>(
        "insert into page_blocks (page_id, user_id, type, content, updated_at) values ($1, $2, 'tiptap-doc', $3, now()) returning id",
        [pageId, userId, content ?? null]
    )
    await dbQuery('update pages set updated_at = now() where id = $1 and user_id = $2', [pageId, userId])
    return NextResponse.json({ blockId: rows[0].id }, { status: 201 })
}
