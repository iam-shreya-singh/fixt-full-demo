'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db, ownerProfiles } from '@/lib/db'

const DEMO_OWNER_ID = 'clerk_demo_owner'
const onboardingSchema = z.object({
  businessName: z.string().trim().min(2, 'Business name must be at least 2 characters.').max(100),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens.'),
  timezone: z.string().min(1),
})

export type OwnerProfile = { userId: string; businessName: string; slug: string; timezone: string; onboardingComplete: boolean }
function ownerId() { return process.env.FIXT_OWNER_ID ?? DEMO_OWNER_ID }

export async function getOwnerProfile(): Promise<OwnerProfile | null> {
  const rows = await db.select({ userId: ownerProfiles.userId, businessName: ownerProfiles.businessName, slug: ownerProfiles.slug, timezone: ownerProfiles.timezone, onboardingComplete: ownerProfiles.onboardingComplete }).from(ownerProfiles).where(eq(ownerProfiles.userId, ownerId()))
  return rows[0] ?? null
}

export async function saveOwnerProfile(input: { businessName: string; slug: string; timezone: string }) {
  const parsed = onboardingSchema.parse(input)
  await db.insert(ownerProfiles).values({ userId: ownerId(), ...parsed, onboardingComplete: true, updatedAt: new Date() }).onConflictDoUpdate({ target: ownerProfiles.userId, set: { ...parsed, onboardingComplete: true, updatedAt: new Date() } })
  revalidatePath('/onboarding')
  revalidatePath('/dashboard')
}
