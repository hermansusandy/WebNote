import { cookies } from 'next/headers'
import { readSessionToken } from '@/lib/session'

export async function requireUserId() {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value
    if (!token) return null
    const session = await readSessionToken(token)
    return session?.userId ?? null
}
