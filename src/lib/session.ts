function base64Encode(input: Uint8Array) {
    let binary = ''
    const chunkSize = 0x8000
    for (let i = 0; i < input.length; i += chunkSize) {
        const chunk = input.subarray(i, i + chunkSize)
        binary += String.fromCharCode(...chunk)
    }
    return btoa(binary)
}

function base64Decode(input: string) {
    const binary = atob(input)
    const out = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i)
    return out
}

function base64UrlEncode(input: Uint8Array) {
    return base64Encode(input).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function base64UrlDecode(input: string) {
    let str = input.replace(/-/g, '+').replace(/_/g, '/')
    const pad = str.length % 4
    if (pad) str += '='.repeat(4 - pad)
    return base64Decode(str)
}

async function importHmacKey(secret: string) {
    const enc = new TextEncoder()
    return crypto.subtle.importKey(
        'raw',
        enc.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign', 'verify']
    )
}

async function hmacSha256(secret: string, data: string) {
    const key = await importHmacKey(secret)
    const enc = new TextEncoder()
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data))
    return new Uint8Array(sig)
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array) {
    if (a.length !== b.length) return false
    let out = 0
    for (let i = 0; i < a.length; i++) out |= a[i] ^ b[i]
    return out === 0
}

export type SessionData = {
    userId: string
    expiresAt: number
}

export async function createSessionToken(data: SessionData) {
    const secret = process.env.AUTH_SECRET
    if (!secret) throw new Error('Missing AUTH_SECRET env var')
    const payload = base64UrlEncode(new TextEncoder().encode(JSON.stringify(data)))
    const sig = base64UrlEncode(await hmacSha256(secret, payload))
    return `${payload}.${sig}`
}

export async function readSessionToken(token: string): Promise<SessionData | null> {
    const secret = process.env.AUTH_SECRET
    if (!secret) throw new Error('Missing AUTH_SECRET env var')
    const [payload, sig] = token.split('.')
    if (!payload || !sig) return null

    const expected = await hmacSha256(secret, payload)
    const actual = base64UrlDecode(sig)
    if (!timingSafeEqual(expected, actual)) return null

    const json = new TextDecoder().decode(base64UrlDecode(payload))
    const data = JSON.parse(json) as SessionData
    if (!data?.userId || !data?.expiresAt) return null
    if (Date.now() > data.expiresAt) return null
    return data
}
