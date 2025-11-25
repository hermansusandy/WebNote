import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const apiKey = request.headers.get('x-api-key')
    if (apiKey !== process.env.N8N_API_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('updated_at', { ascending: false })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabase
        .from('pages')
        .insert([
            { title, content: content || '', user_id, updated_at: new Date().toISOString() }
        ])
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}
