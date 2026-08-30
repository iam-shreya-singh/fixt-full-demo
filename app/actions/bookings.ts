'use server'

import { and, asc, desc, eq } from 'drizzle-orm'
import { formatInTimeZone } from 'date-fns-tz'
import { appointments, db, ownerProfiles } from '@/lib/db'
import { sendEmail } from '@/lib/email/resend'
import { bookingCancelledCustomerEmail } from '@/lib/email/templates'
import { requireOwnerId } from '@/lib/auth/owner'


export type OwnerBooking = {
  id: string
  customerName: string
  customerEmail: string
  serviceName: string
  startsAt: string
  endsAt: string
  status: string
}


export async function getOwnerBookings(): Promise<OwnerBooking[]> {
  const userId = await requireOwnerId()
  const rows = await db.select({
    id: appointments.id,
    customerName: appointments.customerName,
    customerEmail: appointments.customerEmail,
    serviceName: appointments.serviceName,
    startsAt: appointments.startsAt,
    endsAt: appointments.endsAt,
    status: appointments.status,
  }).from(appointments).where(eq(appointments.userId, userId)).orderBy(asc(appointments.startsAt), desc(appointments.createdAt))

  return rows.map((row) => ({ ...row, startsAt: row.startsAt.toISOString(), endsAt: row.endsAt.toISOString() }))
}

export async function cancelOwnerBooking(id: string) {
  const userId = await requireOwnerId()
  if (!id || id.length > 120) throw new Error('Invalid booking reference.')
  const rows = await db.select({
    status: appointments.status, customerEmail: appointments.customerEmail,
    serviceName: appointments.serviceName, startsAt: appointments.startsAt,
  }).from(appointments).where(and(eq(appointments.id, id), eq(appointments.userId, userId)))
  const row = rows[0]
  if (!row) throw new Error('Booking not found.')
  if (row.status === 'cancelled') return { alreadyCancelled: true }
  if (row.status === 'completed' || row.status === 'no_show') throw new Error('This appointment has already taken place and cannot be cancelled.')
  await db.update(appointments).set({ status: 'cancelled' }).where(and(eq(appointments.id, id), eq(appointments.userId, userId)))
  try {
    const ownerRows = await db.select({ businessName: ownerProfiles.businessName, timezone: ownerProfiles.timezone }).from(ownerProfiles).where(eq(ownerProfiles.userId, userId))
    const ownerProfile = ownerRows[0]
    if (ownerProfile) {
      const whenLabel = formatInTimeZone(row.startsAt, ownerProfile.timezone, 'EEE, MMM d · h:mm a zzz')
      await sendEmail(row.customerEmail, 'Your appointment was cancelled', bookingCancelledCustomerEmail(ownerProfile.businessName, row.serviceName, whenLabel))
    }
  } catch (error) {
    console.error('Could not notify customer of cancellation', error)
  }
  return { alreadyCancelled: false }
}

