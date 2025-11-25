import { openai } from '@ai-sdk/openai'
import { streamText, tool } from 'ai'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
    const { messages } = await req.json()

    const result = streamText({
        model: openai('gpt-4o'),
        messages,
        maxSteps: 5,
        system: `You are a helpful AI assistant for a note-taking app called WebNote.
    You can help users by answering questions and creating new pages, learning goals, and reminders.
    
    - To create a todo list, create a page with markdown checkboxes (e.g., "- [ ] Task name").
    - When creating a page, ask for the title and content if not provided.
    - When creating a learning goal, ask for the title. Priority defaults to 'Medium' and status to 'Planned'.
    - When creating a reminder, ask for the title and due date/time.
    
    Always be concise and friendly.`,
        tools: {
            createPage: tool({
                description: 'Create a new page in the note-taking app. Use markdown for content (e.g. "- [ ] task" for todo lists).',
                parameters: z.object({
                    title: z.string().describe('The title of the page'),
                    content: z.string().describe('The initial content of the page (markdown supported)'),
                }),
                execute: async ({ title, content }: { title: string; content: string }) => {
                    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
                    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                    const supabase = createClient(supabaseUrl, supabaseKey)

                    // Try to find a user first.
                    const { data: users } = await supabase.from('users').select('id').limit(1)
                    let userId = users?.[0]?.id

                    if (!userId) {
                        // Fallback: try to get from pages table to see any owner
                        const { data: pages } = await supabase.from('pages').select('user_id').limit(1)
                        userId = pages?.[0]?.user_id
                    }

                    if (!userId) {
                        return 'Error: Could not determine user to assign page to.'
                    }

                    const { data, error } = await supabase
                        .from('pages')
                        .insert([
                            { title, content, user_id: userId, updated_at: new Date().toISOString() }
                        ])
                        .select()
                        .single()

                    if (error) {
                        return `Failed to create page: ${error.message}`
                    }

                    return `Page "${title}" created successfully with ID ${data.id}.`
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
                    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
                    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                    const supabase = createClient(supabaseUrl, supabaseKey)

                    const { data: users } = await supabase.from('users').select('id').limit(1)
                    let userId = users?.[0]?.id
                    if (!userId) {
                        const { data: pages } = await supabase.from('pages').select('user_id').limit(1)
                        userId = pages?.[0]?.user_id
                    }
                    if (!userId) return 'Error: Could not determine user.'

                    const { data, error } = await supabase
                        .from('learning_titles')
                        .insert([{ user_id: userId, title, priority, status }])
                        .select()
                        .single()

                    if (error) return `Failed to create learning goal: ${error.message}`
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
                    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
                    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                    const supabase = createClient(supabaseUrl, supabaseKey)

                    const { data: users } = await supabase.from('users').select('id').limit(1)
                    let userId = users?.[0]?.id
                    if (!userId) {
                        const { data: pages } = await supabase.from('pages').select('user_id').limit(1)
                        userId = pages?.[0]?.user_id
                    }
                    if (!userId) return 'Error: Could not determine user.'

                    const { data, error } = await supabase
                        .from('reminders')
                        .insert([{ user_id: userId, title, due_at: due_at }])
                        .select()
                        .single()

                    if (error) return `Failed to create reminder: ${error.message}`
                    return `Reminder "${title}" created successfully.`
                },
            }),
        },
    })

    return result.toTextStreamResponse()
}
