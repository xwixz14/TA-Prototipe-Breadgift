import { NextResponse, NextRequest } from 'next/server'
import { decrypt } from './lib/session'

// Rute yang butuh penjagaan
const PROTECTED_ROUTES = ['/admin']

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
  
  // 1. Ambil cookie sesi
  const cookie = req.cookies.get('user_session')?.value
  
  // 2. Dekripsi token untuk cek isi datanya
  const session = cookie ? await decrypt(cookie) : null

  // LOGIKA AUTO-REDIRECT UNTUK ADMIN
  // Jika user adalah admin dan mencoba akses halaman utama (/), lempar ke dashboard
  // JANGAN redirect kalau ini adalah POST request (seperti Server Action) agar tidak error
  if (path === '/' && session?.role === 'admin' && req.method !== 'POST') {
    const SECURE_QUERY = "gs_lcrp=EgZjaHJvbWUqBwgAEAAYjwIyBwgAEAAYjwIyDAgBEC4YJxiABBiKBTIGCAIQRRg7MgYIAxBFGDsyDQgEEAAYgwEYsQMYgAQyDQgFEAAYgwEYsQMYgAQyBggGEEUYPTIGCAcQBRhA0gEHOTA2ajBqN6gCALACAA&sourceid=chrome&ie=UTF-8";
    return NextResponse.redirect(new URL(`/admin/dashboard?${SECURE_QUERY}`, req.url))
  }

  // LOGIKA PROTEKSI RUTE ADMIN
  const isAdminRoute = PROTECTED_ROUTES.some(route => path.startsWith(route))
  
  if (isAdminRoute) {
    // Jika tidak ada sesi atau bukan admin, tendang ke /login
    if (!session || session.role !== 'admin') {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  return NextResponse.next()
}

// Konfigurasi Matcher
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/',
    '/admin/:path*',
  ],
}
