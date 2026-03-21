import { NextResponse } from 'next/server'
import { requireUserId } from '@/lib/auth'
import { dbQuery } from '@/lib/db'

export async function GET() {
    const userId = await requireUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const rows = await dbQuery<any>(
        'select * from web_urls where user_id = $1 order by created_at desc',
        [userId]
    )
    return NextResponse.json({ items: rows })
}

export async function POST(req: Request) {
    const userId = await requireUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const name = typeof body.name === 'string' && body.name.trim() ? body.name.trim() : 'New Web URL'
    const url = typeof body.url === 'string' && body.url.trim() ? body.url.trim() : 'https://example.com'
    const category = typeof body.category === 'string' ? body.category : null
    const subCategory = typeof body.sub_category === 'string' ? body.sub_category : null
    const remarks = typeof body.remarks === 'string' ? body.remarks : null

    const rows = await dbQuery<any>(
        `insert into web_urls (user_id, name, url, category, sub_category, remarks, created_at)
         values ($1, $2, $3, $4, $5, $6, now())
         returning *`,
        [userId, name, url, category, subCategory, remarks]
    )
    return NextResponse.json({ item: rows[0] }, { status: 201 })
}
