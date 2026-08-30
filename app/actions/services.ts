'use server'

import { and, asc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db, services } from '@/lib/db'
import { requireOwnerId } from '@/lib/auth/owner'
const serviceSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(80, 'Name is too long.'),
  description: z.string().trim().max(240, 'Description is too long.'),
  durationMinutes: z.coerce.number().int().min(15, 'Duration must be at least 15 minutes.').max(480, 'Duration must be 8 hours or less.'),
  priceCents: z.coerce.number().int().min(0, 'Price cannot be negative.').max(1000000, 'Price is too high.'),
})

type ServiceInput = z.infer<typeof serviceSchema>

export type OwnerService = {
  id: string
  name: string
  description: string
  durationMinutes: number
  priceCents: number
  status: string
}



export async function getOwnerServices(): Promise<OwnerService[]> {
  const userId = await requireOwnerId()
  const rows = await db.select({
    id: services.id,
    name: services.name,
    description: services.description,
    durationMinutes: services.durationMinutes,
    priceCents: services.priceCents,
    status: services.status,
  }).from(services).where(eq(services.userId, userId)).orderBy(asc(services.name))
  return rows
}

export async function createService(input: ServiceInput) {
  const userId = await requireOwnerId()
  const parsed = serviceSchema.parse(input)
  const now = new Date()
  await db.insert(services).values({
    id: `svc_${crypto.randomUUID()}`,
    userId,
    ...parsed,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  })
  revalidatePath('/dashboard/services')
}

export async function updateService(id: string, input: ServiceInput) {
  const userId = await requireOwnerId()
  const parsed = serviceSchema.parse(input)
  await db.update(services).set({ ...parsed, updatedAt: new Date() }).where(and(eq(services.id, id), eq(services.userId, userId)))
  revalidatePath('/dashboard/services')
}

export async function archiveService(id: string) {
  const userId = await requireOwnerId()
  await db.update(services).set({ status: 'archived', updatedAt: new Date() }).where(and(eq(services.id, id), eq(services.userId, userId)))
  revalidatePath('/dashboard/services')
}
