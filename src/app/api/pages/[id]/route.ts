import { NextResponse } from 'next/server'
import { requireUserId } from '@/lib/auth'
import { dbQuery } from '@/lib/db'

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
    const userId = await requireUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await ctx.params

    const pages = await dbQuery<any>('select * from pages where id = $1 and user_id = $2 limit 1', [id, userId])
    const page = pages[0]
    if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const blocks = await dbQuery<{ id: string; content: any }>(
        "select id, content from page_blocks where page_id = $1 and user_id = $2 and type = 'tiptap-doc' limit 1",
        [id, userId]
    )
    const block = blocks[0] || null

    return NextResponse.json({ page, blockId: block?.id ?? null, content: block?.content ?? null })
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
    const userId = await requireUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await ctx.params
    const { title } = await req.json().catch(() => ({}))
    if (typeof title !== 'string') return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

    const rows = await dbQuery<{ id: string; title: string }>(
        'update pages set title = $1, updated_at = now() where id = $2 and user_id = $3 returning id, title',
        [title, id, userId]
    )
    if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ page: rows[0] })
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
    const userId = await requireUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await ctx.params
    await dbQuery('delete from pages where id = $1 and user_id = $2', [id, userId])
    return NextResponse.json({ ok: true })
}
