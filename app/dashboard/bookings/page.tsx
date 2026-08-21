export const dynamic = 'force-dynamic'

import { getOwnerBookings } from '@/app/actions/bookings'
import { BookingList } from '@/components/dashboard/booking-list'

export default async function BookingsPage() {
  const bookings = await getOwnerBookings()
  return <BookingList initialBookings={bookings} />
}
