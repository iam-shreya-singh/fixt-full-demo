import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Protects only the dashboard and onboarding flows
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/onboarding(.*)'])

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) await auth.protect()
})

// Canonical Next.js platform configuration matcher
export const config = {
  matcher: [
    // Bypasses Next.js internal processing and all static assets cleanly
    '/((?!_next|[^?]*\\.[^?]*$).*)',
    // Always monitors API and trpc interaction streams
    '/(api|trpc)(.*)',
  ],
}
