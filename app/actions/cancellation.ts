'use server'
import { clerkClient } from '@clerk/nextjs/server'
import { formatInTimeZone } from 'date-fns-tz'
import { sendEmail } from '@/lib/email/resend'
import { bookingCancelledOwnerEmail } from '@/lib/email/templates'
import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { appointments, db, ownerProfiles } from '@/lib/db'

export type PublicBooking = {
  serviceName: string
  startsAt: string
  endsAt: string
  status: string
  businessName: string
}

export async function getBookingByCancellationToken(token: string): Promise<PublicBooking | null> {
  if (!token || token.length > 200) return null
  const rows = await db.select({
    serviceName: appointments.serviceName,
    startsAt: appointments.startsAt,
    endsAt: appointments.endsAt,
    status: appointments.status,
    businessName: ownerProfiles.businessName,
  }).from(appointments)
    .innerJoin(ownerProfiles, eq(appointments.userId, ownerProfiles.userId))
    .where(eq(appointments.cancellationToken, token))
  const row = rows[0]
  if (!row) return null
  return { serviceName: row.serviceName, startsAt: row.startsAt.toISOString(), endsAt: row.endsAt.toISOString(), status: row.status, businessName: row.businessName }
}

export async function cancelBooking(token: string): Promise<{ alreadyCancelled: boolean }> {
  if (!token || token.length > 200) throw new Error('Invalid cancellation link.')
  const result = await db.transaction(async (tx) => {
    const rows = await tx.select({
      id: appointments.id, status: appointments.status, userId: appointments.userId,
      customerName: appointments.customerName, serviceName: appointments.serviceName, startsAt: appointments.startsAt,
    }).from(appointments).where(eq(appointments.cancellationToken, token))
    const row = rows[0]
    if (!row) throw new Error('We could not find that appointment.')
    if (row.status === 'cancelled') return { alreadyCancelled: true as const }
    if (row.status === 'completed' || row.status === 'no_show') throw new Error('This appointment has already taken place and cannot be cancelled.')
    await tx.update(appointments).set({ status: 'cancelled' }).where(eq(appointments.id, row.id))
    return { alreadyCancelled: false as const, userId: row.userId, customerName: row.customerName, serviceName: row.serviceName, startsAt: row.startsAt }
  })
  revalidatePath('/dashboard/bookings')
  revalidatePath('/dashboard')
  if (!result.alreadyCancelled) {
    try {
      const ownerRows = await db.select({ timezone: ownerProfiles.timezone }).from(ownerProfiles).where(eq(ownerProfiles.userId, result.userId))
      const clerk = await clerkClient()
      const ownerUser = await clerk.users.getUser(result.userId)
      const ownerEmail = ownerUser.emailAddresses[0]?.emailAddress
      const whenLabel = formatInTimeZone(result.startsAt, ownerRows[0]?.timezone ?? 'UTC', 'EEE, MMM d · h:mm a zzz')
      if (ownerEmail) await sendEmail(ownerEmail, 'A booking was cancelled', bookingCancelledOwnerEmail(result.customerName, result.serviceName, whenLabel))
    } catch (error) {
      console.error('Could not notify owner of cancellation', error)
    }
  }
  return { alreadyCancelled: result.alreadyCancelled }
}