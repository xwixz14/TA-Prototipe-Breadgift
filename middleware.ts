import { NextResponse, NextRequest } from 'next/server'
import { decrypt } from './lib/session'

// Rute yang butuh penjagaan "Satpam" (Middleware)
const PROTECTED_ROUTES = ['/admin']

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  
  // Cek apakah rute saat ini termasuk rute admin
  const isAdminRoute = PROTECTED_ROUTES.some(route => path.startsWith(route))
  
  if (isAdminRoute) {
    // 1. Ambil cookie sesi
    const cookie = req.cookies.get('user_session')?.value
    
    // 2. Jika tidak ada cookie, langsung tendang ke /login
    if (!cookie) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // 3. Dekripsi token untuk cek isi datanya
    const session = await decrypt(cookie)

    // 4. Jika sesi tidak valid atau bukan admin, tendang ke /login
    if (!session || session.role !== 'admin') {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // Jika semua OK, izinkan masuk
  return NextResponse.next()
}

// Hanya jalankan middleware ini pada rute-rute tertentu (optimasi performa)
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/admin/:path*',
  ],
}
