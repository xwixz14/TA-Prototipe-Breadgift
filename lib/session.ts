import { SignJWT, jwtVerify } from 'jose'

const secretKey = process.env.SESSION_SECRET;
if (!secretKey) {
  throw new Error("Missing SESSION_SECRET environment variable. Security hardening is active.");
}
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
