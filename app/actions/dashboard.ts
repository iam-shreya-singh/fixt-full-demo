'use server'

import { and, asc, eq, gte, lt } from 'drizzle-orm'
import { appointments, db } from '@/lib/db'
import { getOwnerId } from '@/lib/auth/owner'

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
  // Clerk adapter boundary: replace this owner id with auth().userId when Clerk is connected.
  const ownerId = getOwnerId()
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
  )).orderBy(asc(appointments.startsAt))

  return rows.map((row) => ({ ...row, startsAt: row.startsAt.toISOString(), endsAt: row.endsAt.toISOString() }))
}
