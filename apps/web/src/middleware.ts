import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth(async (req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session?.user
  const pathname = nextUrl.pathname

  // Public routes — always allow
  const isPublic =
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/api/auth')

  if (isPublic) return NextResponse.next()

  // Not logged in → redirect to login
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  // Onboarding guard: if onboarding isn't complete and user isn't already on /onboarding
  // We rely on the (app)/layout.tsx server check for the full profile query,
  // but we can also check a session flag set during OAuth callbacks here.
  // Light guard: just ensure authenticated users can access app routes.
  return NextResponse.next()
})

export const config = {
  // Match all routes except static files and Next.js internals
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
