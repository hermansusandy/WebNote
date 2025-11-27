import { vertex } from '@ai-sdk/google-vertex'
import { streamText } from 'ai'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
    const { prompt } = await req.json()

    const result = streamText({
        model: vertex('gemini-1.5-flash'),
        messages: [
            {
                role: 'system',
                content: 'You are a helpful AI writing assistant. You are helping a user write notes. Output directly the content requested without conversational filler.'
            },
            {
                role: 'user',
                content: prompt
            }
        ],
    })

    return result.toTextStreamResponse()
}
