```typescript
import { google } from '@ai-sdk/google'
import { streamText, tool } from 'ai'
import { z } from 'zod'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
    const { messages } = await req.json()
    console.log("Chat API called with messages:", messages.length)

    const cookieStore = await cookies()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        console.error("No authenticated user found")
        // We can still proceed, but tools might fail if they need auth.
        // Or we can return an error response.
        // For now, let's let it proceed but tools will check for user.
    }

    const result = streamText({
        model: google('gemini-1.5-pro-latest'),
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
                execute: async ({ title, content }: { title: string; content: string }) => {
                    console.log("Executing createPage tool:", title)

                    if (!user) return 'Error: You must be logged in to create a page.'

                    const { data, error } = await supabase
                        .from('pages')
                        .insert([
                            { title, content, user_id: user.id, updated_at: new Date().toISOString() }
                        ])
                        .select()
                        .single()

                    if (error) {
                        console.error("Error creating page:", error)
                        return `Failed to create page: ${ error.message } `
                    }

                    console.log("Page created successfully:", data.id)
                    return `Page "${title}" created successfully with ID ${ data.id }.`
                },
            }),
            createLearning: tool({
                description: 'Create a new learning goal',
                parameters: z.object({
                    title: z.string().describe('The title of the learning goal'),
                    priority: z.enum(['Low', 'Medium', 'High']).optional().describe('Priority of the goal'),
                    status: z.enum(['Planned', 'In Progress', 'Completed']).optional().describe('Status of the goal'),
                }),
                execute: async ({ title, priority = 'Medium', status = 'Planned' }) => {
                    console.log("Executing createLearning tool:", title)
                    if (!user) return 'Error: You must be logged in to create a learning goal.'

                    const { data, error } = await supabase
                        .from('learning_titles')
                        .insert([{ user_id: user.id, title, priority, status }])
                        .select()
                        .single()

                    if (error) {
                        console.error("Error creating learning goal:", error)
                        return `Failed to create learning goal: ${ error.message } `
                    }
                    return `Learning goal "${title}" created successfully.`
                },
            }),
            createReminder: tool({
                description: 'Create a new reminder',
                parameters: z.object({
                    title: z.string().describe('The title of the reminder'),
                    due_at: z.string().describe('The due date and time (ISO string or natural language to be converted)'),
                }),
                execute: async ({ title, due_at }) => {
                    console.log("Executing createReminder tool:", title)
                    if (!user) return 'Error: You must be logged in to create a reminder.'

                    const { data, error } = await supabase
                        .from('reminders')
                        .insert([{ user_id: user.id, title, due_at: due_at }])
                        .select()
                        .single()

                    if (error) {
                        console.error("Error creating reminder:", error)
                        return `Failed to create reminder: ${ error.message } `
                    }
                    return `Reminder "${title}" created successfully.`
                },
            }),
            createWebUrl: tool({
                description: 'Create a new Web URL entry in the Tools/URL page',
                parameters: z.object({
                    name: z.string().describe('The name of the website or tool'),
                    url: z.string().describe('The URL of the website'),
                    category: z.string().optional().describe('The category (e.g., "Development", "Design"). Defaults to "General"'),
                    remarks: z.string().optional().describe('Optional remarks or notes about the URL'),
                }),
                execute: async ({ name, url, category = 'General', remarks = '' }) => {
                    console.log("Executing createWebUrl tool:", name)
                    if (!user) return 'Error: You must be logged in to create a Web URL.'

                    const { data, error } = await supabase
                        .from('web_urls')
                        .insert([{
                            user_id: user.id,
                            name,
                            url,
                            category,
                            remarks
                        }])
                        .select()
                        .single()

                    if (error) {
                        console.error("Error creating Web URL:", error)
                        return `Failed to create Web URL: ${ error.message } `
                    }
                    return `Web URL "${name}" created successfully.`
                },
            }),
            createYoutubeVideo: tool({
                description: 'Create a new YouTube video entry',
                parameters: z.object({
                    name: z.string().describe('The title of the video'),
                    url: z.string().describe('The YouTube URL'),
                    categoryName: z.string().optional().describe('The category name. Will look up or create if needed. Defaults to "General"'),
                    note: z.string().optional().describe('Optional notes about the video'),
                }),
                execute: async ({ name, url, categoryName = 'General', note = '' }) => {
                    console.log("Executing createYoutubeVideo tool:", name)
                    if (!user) return 'Error: You must be logged in to create a YouTube video.'

                    // 1. Find or create category
                    let categoryId: string | null = null

                    const { data: existingCategories } = await supabase
                        .from('youtube_categories')
                        .select('id')
                        .eq('user_id', user.id)
                        .ilike('name', categoryName) // Case-insensitive match
                        .limit(1)

                    if (existingCategories && existingCategories.length > 0) {
                        categoryId = existingCategories[0].id
                    } else {
                        // Create new category
                        const { data: newCategory, error: catError } = await supabase
                            .from('youtube_categories')
                            .insert({ user_id: user.id, name: categoryName })
                            .select('id')
                            .single()

                        if (catError) {
                            console.error("Error creating YouTube category:", catError)
                            return `Failed to create category "${categoryName}": ${ catError.message } `
                        }
                        categoryId = newCategory.id
                    }

                    // 2. Create video item
                    const { data, error } = await supabase
                        .from('youtube_items')
                        .insert([{
                            user_id: user.id,
                            name,
                            url,
                            category_id: categoryId,
                            note
                        }])
                        .select()
                        .single()

                    if (error) {
                        console.error("Error creating YouTube video:", error)
                        return `Failed to create YouTube video: ${ error.message } `
                    }
                    return `YouTube video "${name}" created successfully in category "${categoryName}".`
                },
            }),
            search: tool({
                description: 'Search for resources (pages, learning goals, reminders, URLs, videos) by query',
                parameters: z.object({
                    query: z.string().describe('The search query'),
                }),
                execute: async ({ query }) => {
                    console.log("Executing search tool:", query)
                    if (!user) return 'Error: You must be logged in to search.'

                    const results: any[] = []

                    // Helper to search a table
                    const searchTable = async (table: string, columns: string, type: string) => {
                        const { data } = await supabase
                            .from(table)
                            .select(columns)
                            .eq('user_id', user.id)
                            .or(`title.ilike.% ${ query }%, content.ilike.% ${ query }% `)
                            .limit(5)

                        if (data) {
                            data.forEach((item: any) => {
                                results.push({
                                    id: item.id,
                                    type,
                                    title: item.title || item.name,
                                    snippet: item.content ? item.content.substring(0, 100) : (item.url || item.note || '')
                                })
                            })
                        }
                    }

                    // Search Pages
                    const { data: pages } = await supabase
                        .from('pages')
                        .select('id, title, content')
                        .eq('user_id', user.id)
                        .or(`title.ilike.% ${ query }%, content.ilike.% ${ query }% `)
                        .limit(3)
                    pages?.forEach(p => results.push({ id: p.id, type: 'page', title: p.title, snippet: p.content?.substring(0, 100) }))

                    // Search Learning
                    const { data: learning } = await supabase
                        .from('learning_titles')
                        .select('id, title')
                        .eq('user_id', user.id)
                        .ilike('title', `% ${ query }% `)
                        .limit(3)
                    learning?.forEach(l => results.push({ id: l.id, type: 'learning', title: l.title, snippet: '' }))

                    // Search Reminders
                    const { data: reminders } = await supabase
                        .from('reminders')
                        .select('id, title')
                        .eq('user_id', user.id)
                        .ilike('title', `% ${ query }% `)
                        .limit(3)
                    reminders?.forEach(r => results.push({ id: r.id, type: 'reminder', title: r.title, snippet: '' }))

                    // Search Web URLs
                    const { data: webUrls } = await supabase
                        .from('web_urls')
                        .select('id, name, url, remarks')
                        .eq('user_id', user.id)
                        .or(`name.ilike.% ${ query }%, remarks.ilike.% ${ query }% `)
                        .limit(3)
                    webUrls?.forEach(w => results.push({ id: w.id, type: 'web_url', title: w.name, snippet: w.url }))

                    // Search YouTube
                    const { data: youtube } = await supabase
                        .from('youtube_items')
                        .select('id, name, url, note')
                        .eq('user_id', user.id)
                        .or(`name.ilike.% ${ query }%, note.ilike.% ${ query }% `)
                        .limit(3)
                    youtube?.forEach(y => results.push({ id: y.id, type: 'youtube_video', title: y.name, snippet: y.url }))

                    if (results.length === 0) return "No results found."
                    return JSON.stringify(results)
                },
            }),
            deleteResource: tool({
                description: 'Delete a resource by ID and type',
                parameters: z.object({
                    id: z.string().describe('The ID of the resource to delete'),
                    type: z.enum(['page', 'learning', 'reminder', 'web_url', 'youtube_video']).describe('The type of resource'),
                }),
                execute: async ({ id, type }) => {
                    console.log(`Executing deleteResource tool: ${ type } ${ id } `)
                    if (!user) return 'Error: You must be logged in to delete resources.'

                    let table = ''
                    switch (type) {
                        case 'page': table = 'pages'; break;
                        case 'learning': table = 'learning_titles'; break;
                        case 'reminder': table = 'reminders'; break;
                        case 'web_url': table = 'web_urls'; break;
                        case 'youtube_video': table = 'youtube_items'; break;
                    }

                    const { error } = await supabase
                        .from(table)
                        .delete()
                        .eq('id', id)
                        .eq('user_id', user.id)

                    if (error) {
                        console.error(`Error deleting ${ type }: `, error)
                        return `Failed to delete ${ type }: ${ error.message } `
                    }
                    return `${ type } with ID ${ id } deleted successfully.`
                },
            }),
            updatePage: tool({
                description: 'Update a page title or content',
                parameters: z.object({
                    id: z.string().describe('The ID of the page to update'),
                    title: z.string().optional().describe('The new title'),
                    content: z.string().optional().describe('The new content'),
                }),
                execute: async ({ id, title, content }) => {
                    console.log("Executing updatePage tool:", id)
                    if (!user) return 'Error: You must be logged in to update pages.'

                    const updates: any = { updated_at: new Date().toISOString() }
                    if (title) updates.title = title
                    if (content) updates.content = content

                    const { error } = await supabase
                        .from('pages')
                        .update(updates)
                        .eq('id', id)
                        .eq('user_id', user.id)

                    if (error) return `Failed to update page: ${ error.message } `
                    return `Page updated successfully.`
                },
            }),
            updateLearning: tool({
                description: 'Update a learning goal',
                parameters: z.object({
                    id: z.string().describe('The ID of the learning goal'),
                    title: z.string().optional(),
                    priority: z.enum(['Low', 'Medium', 'High']).optional(),
                    status: z.enum(['Planned', 'In Progress', 'Completed']).optional(),
                }),
                execute: async ({ id, title, priority, status }) => {
                    console.log("Executing updateLearning tool:", id)
                    if (!user) return 'Error: You must be logged in.'

                    const updates: any = {}
                    if (title) updates.title = title
                    if (priority) updates.priority = priority
                    if (status) updates.status = status

                    const { error } = await supabase
                        .from('learning_titles')
                        .update(updates)
                        .eq('id', id)
                        .eq('user_id', user.id)

                    if (error) return `Failed to update learning goal: ${ error.message } `
                    return `Learning goal updated successfully.`
                },
            }),
            updateWebUrl: tool({
                description: 'Update a Web URL',
                parameters: z.object({
                    id: z.string().describe('The ID of the Web URL'),
                    name: z.string().optional(),
                    url: z.string().optional(),
                    category: z.string().optional(),
                    remarks: z.string().optional(),
                }),
                execute: async ({ id, name, url, category, remarks }) => {
                    console.log("Executing updateWebUrl tool:", id)
                    if (!user) return 'Error: You must be logged in.'

                    const updates: any = {}
                    if (name) updates.name = name
                    if (url) updates.url = url
                    if (category) updates.category = category
                    if (remarks) updates.remarks = remarks

                    const { error } = await supabase
                        .from('web_urls')
                        .update(updates)
                        .eq('id', id)
                        .eq('user_id', user.id)

                    if (error) return `Failed to update Web URL: ${ error.message } `
                    return `Web URL updated successfully.`
                },
            }),
            updateYoutubeVideo: tool({
                description: 'Update a YouTube video',
                parameters: z.object({
                    id: z.string().describe('The ID of the video'),
                    name: z.string().optional(),
                    url: z.string().optional(),
                    note: z.string().optional(),
                }),
                execute: async ({ id, name, url, note }) => {
                    console.log("Executing updateYoutubeVideo tool:", id)
                    if (!user) return 'Error: You must be logged in.'

                    const updates: any = {}
                    if (name) updates.name = name
                    if (url) updates.url = url
                    if (note) updates.note = note

                    const { error } = await supabase
                        .from('youtube_items')
                        .update(updates)
                        .eq('id', id)
                        .eq('user_id', user.id)

                    if (error) return `Failed to update YouTube video: ${ error.message } `
                    return `YouTube video updated successfully.`
                },
            }),
        },
    })

    return result.toTextStreamResponse()
}
```
