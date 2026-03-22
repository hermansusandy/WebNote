import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { readSessionToken } from '@/lib/session'
import { dbQuery } from '@/lib/db'

export async function GET() {
    const user = { 
        id: '00000000-0000-0000-0000-000000000000', 
        email: 'admin@webnote.local' 
    }
    return NextResponse.json({ user })
}
