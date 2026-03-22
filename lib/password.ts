import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'

export function hashPassword(password: string) {
    const salt = randomBytes(16)
    const hash = scryptSync(password, salt, 64)
    return `scrypt.${salt.toString('base64')}.${hash.toString('base64')}`
}

export function verifyPassword(password: string, stored: string) {
    const [scheme, saltB64, hashB64] = stored.split('.')
    if (scheme !== 'scrypt' || !saltB64 || !hashB64) return false
    const salt = Buffer.from(saltB64, 'base64')
    const expected = Buffer.from(hashB64, 'base64')
    const actual = scryptSync(password, salt, expected.length)
    return timingSafeEqual(expected, actual)
}
