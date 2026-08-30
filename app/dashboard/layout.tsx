import { getOwnerProfile } from '@/app/actions/onboarding'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await getOwnerProfile()
  if (!profile?.onboardingComplete) redirect('/onboarding')
  return <>
    <nav aria-label="Dashboard navigation" className="border-b border-border bg-background px-5 py-3 md:px-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/dashboard" className="font-serif text-xl">Fixt<span className="text-amber">.</span></Link>
        <div className="flex items-center gap-5">
          <div className="hidden items-center gap-4 text-sm text-muted-foreground sm:flex">
            <Link href="/dashboard/services" className="hover:text-foreground">Services</Link>
            <Link href="/dashboard/availability" className="hover:text-foreground">Availability</Link>
            <Link href="/dashboard/customers" className="hover:text-foreground">Customers</Link>
            <Link href="/dashboard/bookings" className="hover:text-foreground">Bookings</Link>
          </div>
          <UserButton />
        </div>
      </div>
    </nav>
    {children}
  </>
}
