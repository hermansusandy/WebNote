import { google } from '@ai-sdk/google'
// Force rebuild
import { streamText, tool } from 'ai'
import { z } from 'zod'
import { requireUserId } from '@/lib/auth'
import { dbQuery } from '@/lib/db'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

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

export async function POST(req: Request) {
    const { messages } = await req.json()
    console.log("Chat API called with messages:", messages.length)
    const userId = await requireUserId()
    if (userId) console.log("Route User ID:", userId)
    else console.error("No authenticated user found")

    try {
        const result = streamText({
            model: google('gemini-2.5-flash'),
            messages,
            maxSteps: 5,
            system: `You are a helpful AI assistant for a note - taking app called WebNote.
    You can help users by answering questions and managing their content.

    Capabilities:
- Create: Pages(markdown), Learning Goals, Reminders, Web URLs, YouTube Videos.
    - Search: Find any resource by keyword to get its ID.
    - Delete: Remove any resource using its ID and type.

    Rules:
    - To create a todo list, create a page with markdown checkboxes(e.g., "- [ ] Task name").
    - When creating a page, ask for the title and content if not provided.
    - When creating a learning goal, ask for the title.Priority defaults to 'Medium' and status to 'Planned'.
    - When creating a reminder, ask for the title and due date / time.
    - To delete or update something, FIRST search for it to get the ID, then perform the action.
    
    Always be concise and friendly.`,
            tools: {
                createPage: tool({
                    description: 'Create a new page in the note-taking app. Use markdown for content (e.g. "- [ ] task" for todo lists).',
                    parameters: z.object({
                        title: z.string().describe('The title of the page'),
                        content: z.string().describe('The initial content of the page (markdown supported)'),
                    }),
                    execute: async (args: any) => {
                        const { title, content } = args
                        console.log("Executing createPage tool:", title)

                        if (!userId) return 'Error: You must be logged in to create a page.'

                        const pages = await dbQuery<{ id: string }>(
                            'insert into pages (user_id, title, updated_at) values ($1, $2, now()) returning id',
                            [userId, title]
                        )
                        const pageId = pages[0]?.id
                        if (!pageId) return 'Failed to create page.'

                        const doc = markdownToTiptapDoc(content)
                        await dbQuery(
                            "insert into page_blocks (page_id, user_id, type, content, updated_at) values ($1, $2, 'tiptap-doc', $3::jsonb, now())",
                            [pageId, userId, JSON.stringify(doc)]
                        )

                        console.log("Page created successfully:", pageId)
                        return `Page "${title}" created successfully with ID ${pageId}.`
                    },
                } as any),
                createLearning: tool({
                    description: 'Create a new learning goal',
                    parameters: z.object({
                        title: z.string().describe('The title of the learning goal'),
                        priority: z.enum(['Low', 'Medium', 'High']).optional().describe('Priority of the goal'),
                        status: z.enum(['Planned', 'In Progress', 'Completed']).optional().describe('Status of the goal'),
                    }),
                    execute: async (args: any) => {
                        const { title, priority = 'Medium', status = 'Planned' } = args
                        console.log("Executing createLearning tool:", title)
                        if (!userId) return 'Error: You must be logged in to create a learning goal.'
                        await dbQuery(
                            'insert into learning_titles (user_id, title, priority, status, created_at, updated_at) values ($1, $2, $3, $4, now(), now())',
                            [userId, title, priority, status]
                        )
                        return `Learning goal "${title}" created successfully.`
                    },
                } as any),
                createReminder: tool({
                    description: 'Create a new reminder',
                    parameters: z.object({
                        title: z.string().describe('The title of the reminder'),
                        due_at: z.string().describe('The due date and time (ISO string or natural language to be converted)'),
                    }),
                    execute: async (args: any) => {
                        const { title, due_at } = args
                        console.log("Executing createReminder tool:", title)
                        if (!userId) return 'Error: You must be logged in to create a reminder.'
                        await dbQuery(
                            'insert into reminders (user_id, title, due_at, created_at, updated_at) values ($1, $2, $3, now(), now())',
                            [userId, title, due_at]
                        )
                        return `Reminder "${title}" created successfully.`
                    },
                } as any),
                createWebUrl: tool({
                    description: 'Create a new Web URL entry in the Tools/URL page',
                    parameters: z.object({
                        name: z.string().describe('The name of the website or tool'),
                        url: z.string().describe('The URL of the website'),
                        category: z.string().optional().describe('The category (e.g., "Development", "Design"). Defaults to "General"'),
                        remarks: z.string().optional().describe('Optional remarks or notes about the URL'),
                    }),
                    execute: async (args: any) => {
                        const { name, url, category = 'General', remarks = '' } = args
                        console.log("Executing createWebUrl tool:", name)
                        if (!userId) return 'Error: You must be logged in to create a Web URL.'
                        await dbQuery(
                            'insert into web_urls (user_id, name, url, category, remarks, created_at) values ($1, $2, $3, $4, $5, now())',
                            [userId, name, url, category, remarks]
                        )
                        return `Web URL "${name}" created successfully.`
                    },
                } as any),
                createYoutubeVideo: tool({
                    description: 'Create a new YouTube video entry',
                    parameters: z.object({
                        name: z.string().describe('The title of the video'),
                        url: z.string().describe('The YouTube URL'),
                        categoryName: z.string().optional().describe('The category name. Will look up or create if needed. Defaults to "General"'),
                        note: z.string().optional().describe('Optional notes about the video'),
                    }),
                    execute: async (args: any) => {
                        const { name, url, categoryName = 'General', note = '' } = args
                        console.log("Executing createYoutubeVideo tool:", name)
                        if (!userId) return 'Error: You must be logged in to create a YouTube video.'

                        const existing = await dbQuery<{ id: string }>(
                            'select id from youtube_categories where user_id = $1 and lower(name) = lower($2) limit 1',
                            [userId, categoryName]
                        )
                        let categoryId = existing[0]?.id
                        if (!categoryId) {
                            const inserted = await dbQuery<{ id: string }>(
                                'insert into youtube_categories (user_id, name, created_at) values ($1, $2, now()) returning id',
                                [userId, categoryName]
                            )
                            categoryId = inserted[0]?.id
                        }
                        if (!categoryId) return `Failed to create category "${categoryName}".`

                        await dbQuery(
                            'insert into youtube_items (user_id, name, url, category_id, note, created_at, updated_at) values ($1, $2, $3, $4, $5, now(), now())',
                            [userId, name, url, categoryId, note]
                        )
                        return `YouTube video "${name}" created successfully in category "${categoryName}".`
                    },
                } as any),
                search: tool({
                    description: 'Search for resources (pages, learning goals, reminders, URLs, videos) by query',
                    parameters: z.object({
                        query: z.string().describe('The search query'),
                    }),
                    execute: async (args: any) => {
                        const { query } = args
                        console.log("Executing search tool:", query)
                        if (!userId) return 'Error: You must be logged in to search.'

                        const results: any[] = []

                        // Search Pages
                        const pages = await dbQuery<{ id: string; title: string; content_text: string }>(
                            `select p.id, p.title, coalesce(pb.content::text, '') as content_text
                             from pages p
                             left join lateral (
                                select content
                                from page_blocks
                                where page_id = p.id and user_id = p.user_id and type = 'tiptap-doc'
                                order by updated_at desc
                                limit 1
                             ) pb on true
                             where p.user_id = $1 and (p.title ilike $2 or pb.content::text ilike $2)
                             order by p.updated_at desc
                             limit 3`,
                            [userId, `%${query}%`]
                        )
                        pages.forEach(p => results.push({ id: p.id, type: 'page', title: p.title, snippet: p.content_text.substring(0, 120) }))

                        // Search Learning
                        const learning = await dbQuery<{ id: string; title: string }>(
                            'select id, title from learning_titles where user_id = $1 and title ilike $2 order by updated_at desc limit 3',
                            [userId, `%${query}%`]
                        )
                        learning.forEach(l => results.push({ id: l.id, type: 'learning', title: l.title, snippet: '' }))

                        // Search Reminders
                        const reminders = await dbQuery<{ id: string; title: string }>(
                            'select id, title from reminders where user_id = $1 and title ilike $2 order by updated_at desc limit 3',
                            [userId, `%${query}%`]
                        )
                        reminders.forEach(r => results.push({ id: r.id, type: 'reminder', title: r.title, snippet: '' }))

                        // Search Web URLs
                        const webUrls = await dbQuery<{ id: string; name: string; url: string; remarks: string | null }>(
                            `select id, name, url, remarks
                             from web_urls
                             where user_id = $1 and (name ilike $2 or remarks ilike $2)
                             order by created_at desc
                             limit 3`,
                            [userId, `%${query}%`]
                        )
                        webUrls.forEach(w => results.push({ id: w.id, type: 'web_url', title: w.name, snippet: w.url }))

                        // Search YouTube
                        const youtube = await dbQuery<{ id: string; name: string; url: string; note: string | null }>(
                            `select id, name, url, note
                             from youtube_items
                             where user_id = $1 and (name ilike $2 or note ilike $2)
                             order by created_at desc
                             limit 3`,
                            [userId, `%${query}%`]
                        )
                        youtube.forEach(y => results.push({ id: y.id, type: 'youtube_video', title: y.name, snippet: y.url }))

                        if (results.length === 0) return "No results found."
                        return JSON.stringify(results)
                    },
                } as any),
                deleteResource: tool({
                    description: 'Delete a resource by ID and type',
                    parameters: z.object({
                        id: z.string().describe('The ID of the resource to delete'),
                        type: z.enum(['page', 'learning', 'reminder', 'web_url', 'youtube_video']).describe('The type of resource'),
                    }),
                    execute: async (args: any) => {
                        const { id, type } = args
                        console.log(`Executing deleteResource tool: ${type} ${id} `)
                        if (!userId) return 'Error: You must be logged in to delete resources.'

                        let table = ''
                        switch (type) {
                            case 'page': table = 'pages'; break;
                            case 'learning': table = 'learning_titles'; break;
                            case 'reminder': table = 'reminders'; break;
                            case 'web_url': table = 'web_urls'; break;
                            case 'youtube_video': table = 'youtube_items'; break;
                        }

                        await dbQuery(`delete from ${table} where id = $1 and user_id = $2`, [id, userId])
                        return `${type} with ID ${id} deleted successfully.`
                    },
                } as any),
                updatePage: tool({
                    description: 'Update a page title or content',
                    parameters: z.object({
                        id: z.string().describe('The ID of the page to update'),
                        title: z.string().optional().describe('The new title'),
                        content: z.string().optional().describe('The new content'),
                    }),
                    execute: async (args: any) => {
                        const { id, title, content } = args
                        console.log("Executing updatePage tool:", id)
                        if (!userId) return 'Error: You must be logged in to update pages.'

                        if (title) {
                            await dbQuery('update pages set title = $1, updated_at = now() where id = $2 and user_id = $3', [
                                title,
                                id,
                                userId,
                            ])
                        } else {
                            await dbQuery('update pages set updated_at = now() where id = $1 and user_id = $2', [id, userId])
                        }

                        if (typeof content === 'string') {
                            const existing = await dbQuery<{ id: string }>(
                                "select id from page_blocks where page_id = $1 and user_id = $2 and type = 'tiptap-doc' limit 1",
                                [id, userId]
                            )
                            const doc = markdownToTiptapDoc(content)
                            if (existing[0]) {
                                await dbQuery('update page_blocks set content = $1::jsonb, updated_at = now() where id = $2 and user_id = $3', [
                                    JSON.stringify(doc),
                                    existing[0].id,
                                    userId,
                                ])
                            } else {
                                await dbQuery(
                                    "insert into page_blocks (page_id, user_id, type, content, updated_at) values ($1, $2, 'tiptap-doc', $3::jsonb, now())",
                                    [id, userId, JSON.stringify(doc)]
                                )
                            }
                        }
                        return `Page updated successfully.`
                    },
                } as any),
                updateLearning: tool({
                    description: 'Update a learning goal',
                    parameters: z.object({
                        id: z.string().describe('The ID of the learning goal'),
                        title: z.string().optional(),
                        priority: z.enum(['Low', 'Medium', 'High']).optional(),
                        status: z.enum(['Planned', 'In Progress', 'Completed']).optional(),
                    }),
                    execute: async (args: any) => {
                        const { id, title, priority, status } = args
                        console.log("Executing updateLearning tool:", id)
                        if (!userId) return 'Error: You must be logged in.'

                        const updates: any = {}
                        if (title) updates.title = title
                        if (priority) updates.priority = priority
                        if (status) updates.status = status

                        const fields = Object.keys(updates)
                        if (!fields.length) return 'No updates provided.'
                        const sets = fields.map((k, i) => `${k} = $${i + 1}`).join(', ')
                        const params = [...fields.map(k => updates[k]), id, userId]
                        await dbQuery(`update learning_titles set ${sets}, updated_at = now() where id = $${fields.length + 1} and user_id = $${fields.length + 2}`, params)
                        return `Learning goal updated successfully.`
                    },
                } as any),
                updateWebUrl: tool({
                    description: 'Update a Web URL',
                    parameters: z.object({
                        id: z.string().describe('The ID of the Web URL'),
                        name: z.string().optional(),
                        url: z.string().optional(),
                        category: z.string().optional(),
                        remarks: z.string().optional(),
                    }),
                    execute: async (args: any) => {
                        const { id, name, url, category, remarks } = args
                        console.log("Executing updateWebUrl tool:", id)
                        if (!userId) return 'Error: You must be logged in.'

                        const updates: any = {}
                        if (name) updates.name = name
                        if (url) updates.url = url
                        if (category) updates.category = category
                        if (remarks) updates.remarks = remarks

                        const fields = Object.keys(updates)
                        if (!fields.length) return 'No updates provided.'
                        const sets = fields.map((k, i) => `${k} = $${i + 1}`).join(', ')
                        const params = [...fields.map(k => updates[k]), id, userId]
                        await dbQuery(`update web_urls set ${sets} where id = $${fields.length + 1} and user_id = $${fields.length + 2}`, params)
                        return `Web URL updated successfully.`
                    },
                } as any),
                updateYoutubeVideo: tool({
                    description: 'Update a YouTube video',
                    parameters: z.object({
                        id: z.string().describe('The ID of the video'),
                        name: z.string().optional(),
                        url: z.string().optional(),
                        note: z.string().optional(),
                    }),
                    execute: async (args: any) => {
                        const { id, name, url, note } = args
                        console.log("Executing updateYoutubeVideo tool:", id)
                        if (!userId) return 'Error: You must be logged in.'

                        const updates: any = {}
                        if (name) updates.name = name
                        if (url) updates.url = url
                        if (note) updates.note = note

                        const fields = Object.keys(updates)
                        if (!fields.length) return 'No updates provided.'
                        const sets = fields.map((k, i) => `${k} = $${i + 1}`).join(', ')
                        const params = [...fields.map(k => updates[k]), id, userId]
                        await dbQuery(`update youtube_items set ${sets}, updated_at = now() where id = $${fields.length + 1} and user_id = $${fields.length + 2}`, params)
                        return `YouTube video updated successfully.`
                    },
                } as any),
            },
        } as any)

        return result.toTextStreamResponse()
    } catch (error: any) {
        console.error("AI Chat Error:", error)
        return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }
}
