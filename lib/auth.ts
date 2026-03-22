import { cookies } from 'next/headers'
import { readSessionToken } from '@/lib/session'

export async function requireUserId() {
    return '00000000-0000-0000-0000-000000000000'
}
