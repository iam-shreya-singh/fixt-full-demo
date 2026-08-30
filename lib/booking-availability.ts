import { and, eq, gt, lt } from 'drizzle-orm'
import { fromZonedTime } from 'date-fns-tz'
import { appointments, availability, db } from '@/lib/db'

function weekdayForDate(date: string) {
  return new Date(`${date}T12:00:00Z`).getUTCDay()
}

function dateBounds(date: string, timezone: string) {
  const start = fromZonedTime(`${date}T00:00:00`, timezone)
  const next = new Date(`${date}T12:00:00Z`)
  next.setUTCDate(next.getUTCDate() + 1)
  return { start, end: fromZonedTime(`${next.toISOString().slice(0, 10)}T00:00:00`, timezone) }
}

function slotsForHours(date: string, timezone: string, startTime: string, endTime: string, durationMinutes: number) {
  const start = fromZonedTime(`${date}T${startTime}:00`, timezone)
  const end = fromZonedTime(`${date}T${endTime}:00`, timezone)
  const slots: Date[] = []
  for (let current = start; current.getTime() + durationMinutes * 60_000 <= end.getTime(); current = new Date(current.getTime() + durationMinutes * 60_000)) {
    slots.push(current)
  }
  return slots
}

export async function getAvailableStarts(userId: string, timezone: string, service: { durationMinutes: number }, date: string, minNoticeMinutes = 60) {
  const hours = await db.select({ startTime: availability.startTime, endTime: availability.endTime })
    .from(availability)
    .where(and(eq(availability.userId, userId), eq(availability.weekday, weekdayForDate(date)), eq(availability.enabled, true)))
  if (!hours.length) return []

  const { start, end } = dateBounds(date, timezone)
  const existing = await db.select({ startsAt: appointments.startsAt, endsAt: appointments.endsAt })
    .from(appointments)
    .where(and(eq(appointments.userId, userId), eq(appointments.status, 'confirmed'), lt(appointments.startsAt, end), gt(appointments.endsAt, start)))
  const durationMs = service.durationMinutes * 60_000
  const earliestBookable = new Date(Date.now() + minNoticeMinutes * 60_000)
  return hours.flatMap((hours) => slotsForHours(date, timezone, hours.startTime, hours.endTime, service.durationMinutes))
    .filter((slot) => slot >= earliestBookable)
    .filter((slot) => !existing.some((appointment) => slot < appointment.endsAt && new Date(slot.getTime() + durationMs) > appointment.startsAt))
}
