import { getPublicBusiness } from '@/app/actions/public-booking'
import { PublicBookingPage } from '@/components/booking/public-booking-page'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function BookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const business = await getPublicBusiness(slug)
  if (!business) notFound()
  return <PublicBookingPage slug={slug} business={business} />
}
