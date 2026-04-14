import { SignJWT, jwtVerify } from 'jose'

// Saran: Atur SESSION_SECRET di file .env untuk keamanan di server produksi
const secretKey = process.env.SESSION_SECRET || "super_secret_breadgift_key_2026_xYz!"
const encodedKey = new TextEncoder().encode(secretKey)

export async function encrypt(payload: any) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(encodedKey)
}

export async function decrypt(session: string | undefined = '') {
  try {
    if (!session) return null;
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    })
    return payload
  } catch (error) {
    // Return null if token is invalid, expired, or tampered with
    return null
  }
}
