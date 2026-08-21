export const dynamic = 'force-dynamic'

import { getOwnerAvailability } from '@/app/actions/availability'
import { AvailabilityManager } from '@/components/dashboard/availability-manager'

export default async function AvailabilityPage() {
  const rows = await getOwnerAvailability()
  return <main className="mx-auto min-h-screen max-w-5xl bg-paper px-6 py-10 text-ink md:px-10"><AvailabilityManager initialRows={rows} /></main>
}
