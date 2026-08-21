'use server'

import { and, asc, desc, eq } from 'drizzle-orm'
import { appointments, db } from '@/lib/db'
import { getOwnerId } from '@/lib/auth/owner'

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
  const rows = await db.select({
    id: appointments.id,
    customerName: appointments.customerName,
    customerEmail: appointments.customerEmail,
    serviceName: appointments.serviceName,
    startsAt: appointments.startsAt,
    endsAt: appointments.endsAt,
    status: appointments.status,
  }).from(appointments).where(eq(appointments.userId, getOwnerId())).orderBy(asc(appointments.startsAt), desc(appointments.createdAt))

  return rows.map((row) => ({ ...row, startsAt: row.startsAt.toISOString(), endsAt: row.endsAt.toISOString() }))
}

export async function cancelOwnerBooking(id: string) {
  if (!id || id.length > 120) throw new Error('Invalid booking reference.')
  await db.update(appointments).set({ status: 'cancelled' }).where(and(eq(appointments.id, id), eq(appointments.userId, getOwnerId())))
}
