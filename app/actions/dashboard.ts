'use server'

import { and, asc, eq, gte, lt, ne } from 'drizzle-orm'
import { formatInTimeZone } from 'date-fns-tz'
import { appointments, db, ownerProfiles, services } from '@/lib/db'
import { requireOwnerId } from '@/lib/auth/owner'
import { getAvailableStarts } from '@/lib/booking-availability'
import { revalidatePath } from 'next/cache'
export type DashboardAppointment = {
  id: string
  customerName: string
  customerEmail: string
  serviceName: string
  startsAt: string
  endsAt: string
  status: string
}

export async function getOwnerDashboard(): Promise<DashboardAppointment[]> {
  const ownerId = await requireOwnerId()
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 8)

  const rows = await db.select({
    id: appointments.id,
    customerName: appointments.customerName,
    customerEmail: appointments.customerEmail,
    serviceName: appointments.serviceName,
    startsAt: appointments.startsAt,
    endsAt: appointments.endsAt,
    status: appointments.status,
  }).from(appointments).where(and(
    eq(appointments.userId, ownerId),
    gte(appointments.startsAt, start),
    lt(appointments.startsAt, end),
    ne(appointments.status, 'cancelled'),
  )).orderBy(asc(appointments.startsAt))

  return rows.map((row) => ({ ...row, startsAt: row.startsAt.toISOString(), endsAt: row.endsAt.toISOString() }))
}

export async function getOpenCapacity(): Promise<number> {
  const ownerId = await requireOwnerId()
  const profileRows = await db.select({ timezone: ownerProfiles.timezone }).from(ownerProfiles).where(eq(ownerProfiles.userId, ownerId))
  const profile = profileRows[0]
  if (!profile) return 0

  const serviceRows = await db.select({ durationMinutes: services.durationMinutes }).from(services)
    .where(and(eq(services.userId, ownerId), eq(services.status, 'active')))
    .orderBy(asc(services.durationMinutes))
    .limit(1)
  const service = serviceRows[0]
  if (!service) return 0

  const today = formatInTimeZone(new Date(), profile.timezone, 'yyyy-MM-dd')
  const dates = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(`${today}T12:00:00Z`)
    date.setUTCDate(date.getUTCDate() + offset)
    return date.toISOString().slice(0, 10)
  })
  const slots = await Promise.all(dates.map((date) => getAvailableStarts(ownerId, profile.timezone, service, date)))
  return slots.reduce((total, daySlots) => total + daySlots.length, 0)
}
export async function markBookingCompleted(id: string) {
  const userId = await requireOwnerId()
  await db.update(appointments).set({ status: 'completed' }).where(and(eq(appointments.id, id), eq(appointments.userId, userId)))
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/bookings')
}

export async function markBookingNoShow(id: string) {
  const userId = await requireOwnerId()
  await db.update(appointments).set({ status: 'no_show' }).where(and(eq(appointments.id, id), eq(appointments.userId, userId)))
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/bookings')
}