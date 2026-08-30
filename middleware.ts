import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Protects only the dashboard and onboarding flows
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/onboarding(.*)'])

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) await auth.protect()
})

// Updated Next.js configuration matcher to handle Clerk Auto-Proxy
export const config = {
  matcher: [
    '/__clerk/:path*',
    '/((?!_next|[^?]*\\.[^?]*$).*)',
    '/(api|trpc)(.*)',
  ],
}
