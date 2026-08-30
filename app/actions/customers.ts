'use server'

import { and, asc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { customers, db } from '@/lib/db'
import { requireOwnerId } from '@/lib/auth/owner'
const schema = z.object({ name: z.string().trim().min(2).max(100), email: z.string().trim().email(), phone: z.string().trim().max(40), notes: z.string().trim().max(500) })
export type OwnerCustomer = { id: string; name: string; email: string; phone: string; notes: string; lastBookingAt: string | null }
export async function getOwnerCustomers(): Promise<OwnerCustomer[]> { const userId = await requireOwnerId(); const rows = await db.select({ id: customers.id, name: customers.name, email: customers.email, phone: customers.phone, notes: customers.notes, lastBookingAt: customers.lastBookingAt }).from(customers).where(eq(customers.userId, userId)).orderBy(asc(customers.name)); return rows.map((r) => ({ ...r, lastBookingAt: r.lastBookingAt?.toISOString() ?? null })) }
export async function updateCustomer(id: string, input: z.input<typeof schema>) { const userId = await requireOwnerId(); const parsed = schema.parse(input); await db.update(customers).set(parsed).where(and(eq(customers.id, id), eq(customers.userId, userId))); revalidatePath('/dashboard/customers') }

//#Fix1 Add and to the import and scope the where clause to the owner
