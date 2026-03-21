import { NextResponse } from 'next/server'
import { dbQuery } from '@/lib/db'

function markdownToTiptapDoc(markdown: string) {
    const lines = markdown.split(/\r?\n/)
    const nodes: any[] = []
    let taskItems: any[] = []

    const flushTasks = () => {
        if (!taskItems.length) return
        nodes.push({ type: 'taskList', content: taskItems })
        taskItems = []
    }

    for (const rawLine of lines) {
        const line = rawLine.replace(/\t/g, '    ')
        const checkboxMatch = line.match(/^\s*-\s*\[([ xX])\]\s*(.*)$/)

        if (checkboxMatch) {
            const checked = checkboxMatch[1].toLowerCase() === 'x'
            const text = checkboxMatch[2] || ''
            taskItems.push({
                type: 'taskItem',
                attrs: { checked },
                content: [
                    text
                        ? { type: 'paragraph', content: [{ type: 'text', text }] }
                        : { type: 'paragraph' },
                ],
            })
            continue
        }

        if (!line.trim()) {
            flushTasks()
            if (nodes.length && nodes[nodes.length - 1]?.type === 'paragraph') continue
            nodes.push({ type: 'paragraph' })
            continue
        }

        flushTasks()
        nodes.push({ type: 'paragraph', content: [{ type: 'text', text: line }] })
    }

    flushTasks()

    return { type: 'doc', content: nodes.length ? nodes : [{ type: 'paragraph' }] }
}

export async function GET(request: Request) {
    const apiKey = request.headers.get('x-api-key')
    if (apiKey !== process.env.N8N_API_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rows = await dbQuery<any>('select * from pages order by updated_at desc')
    return NextResponse.json(rows)
}

export async function POST(request: Request) {
    const apiKey = request.headers.get('x-api-key')
    if (apiKey !== process.env.N8N_API_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, user_id } = body

    if (!title || !user_id) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const pages = await dbQuery<{ id: string }>(
        'insert into pages (user_id, title, updated_at) values ($1, $2, now()) returning id',
        [user_id, title]
    )
    const pageId = pages[0]?.id
    if (!pageId) return NextResponse.json({ error: 'Failed to create page' }, { status: 500 })

    if (typeof content === 'string' && content.length) {
        const doc = markdownToTiptapDoc(content)
        await dbQuery(
            "insert into page_blocks (page_id, user_id, type, content, updated_at) values ($1, $2, 'tiptap-doc', $3::jsonb, now())",
            [pageId, user_id, JSON.stringify(doc)]
        )
    }

    return NextResponse.json({ id: pageId, user_id, title, content: content || '' }, { status: 201 })
}
