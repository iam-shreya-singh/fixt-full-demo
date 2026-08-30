'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { availability, db, ownerProfiles } from '@/lib/db'
import { requireOwnerId } from '@/lib/auth/owner'
const onboardingSchema = z.object({
  businessName: z.string().trim().min(2, 'Business name must be at least 2 characters.').max(100),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens.'),
  timezone: z.string().min(1),
})

export type OwnerProfile = { userId: string; businessName: string; slug: string; timezone: string; onboardingComplete: boolean }


export async function getOwnerProfile(): Promise<OwnerProfile | null> {
  const userId = await requireOwnerId()
  const rows = await db.select({ userId: ownerProfiles.userId, businessName: ownerProfiles.businessName, slug: ownerProfiles.slug, timezone: ownerProfiles.timezone, onboardingComplete: ownerProfiles.onboardingComplete }).from(ownerProfiles).where(eq(ownerProfiles.userId, userId))
  return rows[0] ?? null
}

export async function saveOwnerProfile(input: { businessName: string; slug: string; timezone: string }) {
  const userId = await requireOwnerId()
  const parsed = onboardingSchema.parse(input)
  const existingProfile = await db.select({ userId: ownerProfiles.userId }).from(ownerProfiles).where(eq(ownerProfiles.userId, userId))

  //app/actions/onboarding.ts, add the pre-check block before the insert, and the throw for a taken slug
  const existing = await db
  .select({ userId: ownerProfiles.userId })
  .from(ownerProfiles)
  .where(eq(ownerProfiles.slug, parsed.slug))

if (existing.length > 0 && existing[0].userId !== userId) {
  throw new Error('That booking URL is already taken. Please choose another.')
} //Fix#4 above

  await db.transaction(async (tx) => {
    await tx.insert(ownerProfiles).values({ userId, ...parsed, onboardingComplete: true, updatedAt: new Date() }).onConflictDoUpdate({ target: ownerProfiles.userId, set: { ...parsed, onboardingComplete: true, updatedAt: new Date() } })

    if (existingProfile.length === 0) {
      await tx.insert(availability).values(Array.from({ length: 7 }, (_, weekday) => ({
        id: `avl_${crypto.randomUUID()}`,
        userId,
        weekday,
        startTime: '09:00',
        endTime: '17:00',
        enabled: false,
      })))
    }
  })
  revalidatePath('/onboarding')
  revalidatePath('/dashboard')
}
