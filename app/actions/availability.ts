'use server'

import { and, asc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { availability, db } from '@/lib/db'
import { requireOwnerId } from '@/lib/auth/owner'
const availabilitySchema = z.object({
  weekday: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  enabled: z.boolean(),
}).refine((value) => value.startTime < value.endTime, { message: 'End time must be after start time.' })

export type OwnerAvailability = {
  id: string
  weekday: number
  startTime: string
  endTime: string
  enabled: boolean
}



export async function getOwnerAvailability(): Promise<OwnerAvailability[]> {
  const userId = await requireOwnerId()
  return db.select({ id: availability.id, weekday: availability.weekday, startTime: availability.startTime, endTime: availability.endTime, enabled: availability.enabled })
    .from(availability).where(eq(availability.userId, userId)).orderBy(asc(availability.weekday))
}

export async function updateOwnerAvailability(input: OwnerAvailability[]) {
  const parsed = z.array(availabilitySchema).length(7).parse(input)
  const userId = await requireOwnerId()
  await db.transaction(async (tx) => {
    for (const row of parsed) {
      await tx.update(availability).set({ startTime: row.startTime, endTime: row.endTime, enabled: row.enabled })
        .where(and(eq(availability.userId, userId), eq(availability.weekday, row.weekday)))
    }
  })
  revalidatePath('/dashboard/availability')
  revalidatePath('/book/[slug]', 'page')
}
