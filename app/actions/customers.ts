'use server'

import { asc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { customers, db } from '@/lib/db'
import { getOwnerId } from '@/lib/auth/owner'
const schema = z.object({ name: z.string().trim().min(2).max(100), email: z.string().trim().email(), phone: z.string().trim().max(40), notes: z.string().trim().max(500) })
export type OwnerCustomer = { id: string; name: string; email: string; phone: string; notes: string; lastBookingAt: string | null }
export async function getOwnerCustomers(): Promise<OwnerCustomer[]> { const rows = await db.select({ id: customers.id, name: customers.name, email: customers.email, phone: customers.phone, notes: customers.notes, lastBookingAt: customers.lastBookingAt }).from(customers).where(eq(customers.userId, getOwnerId())).orderBy(asc(customers.name)); return rows.map((r) => ({ ...r, lastBookingAt: r.lastBookingAt?.toISOString() ?? null })) }
export async function updateCustomer(id: string, input: z.input<typeof schema>) { const parsed = schema.parse(input); await db.update(customers).set(parsed).where(eq(customers.id, id)); revalidatePath('/dashboard/customers') }
