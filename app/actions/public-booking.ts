'use server'
import { customers } from '@/lib/db'
import { clerkClient } from '@clerk/nextjs/server'
import { sendEmail } from '@/lib/email/resend'
import { bookingConfirmedCustomerEmail, bookingConfirmedOwnerEmail } from '@/lib/email/templates'
import { and, eq, gt, lt } from 'drizzle-orm'
import { formatInTimeZone } from 'date-fns-tz'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { appointments, db, ownerProfiles, services } from '@/lib/db'
import { getAvailableStarts } from '@/lib/booking-availability'

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please choose a valid date.')
const publicAvailabilitySchema = z.object({
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid booking URL.'),
  serviceId: z.string().trim().min(1),
  date: dateSchema,
})
const bookingSchema = z.object({
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid booking URL.'),
  serviceId: z.string().trim().min(1),
  startsAt: z.string().datetime({ offset: true }),
  customerName: z.string().trim().min(2, 'Please enter your name.').max(100),
  customerEmail: z.string().trim().email('Please enter a valid email address.').max(254),
  customerPhone: z.string().trim().max(40).optional(),
})

export type PublicService = {
  id: string
  name: string
  description: string
  durationMinutes: number
  priceCents: number
}

export type PublicBusiness = {
  businessName: string
  timezone: string
  services: PublicService[]
}

async function getOwner(slug: string) {
  const rows = await db.select({ userId: ownerProfiles.userId, slug: ownerProfiles.slug, timezone: ownerProfiles.timezone, businessName: ownerProfiles.businessName })
    .from(ownerProfiles).where(eq(ownerProfiles.slug, slug))
  return rows[0] ?? null
}

export async function getPublicBusiness(slug: string): Promise<PublicBusiness | null> {
  const normalizedSlug = z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).safeParse(slug)
  if (!normalizedSlug.success) return null
  const rows = await db.select({ userId: ownerProfiles.userId, businessName: ownerProfiles.businessName, timezone: ownerProfiles.timezone })
    .from(ownerProfiles).where(eq(ownerProfiles.slug, normalizedSlug.data))
  const owner = rows[0]
  if (!owner) return null
  const activeServices = await db.select({ id: services.id, name: services.name, description: services.description, durationMinutes: services.durationMinutes, priceCents: services.priceCents })
    .from(services).where(and(eq(services.userId, owner.userId), eq(services.status, 'active')))
  return { businessName: owner.businessName, timezone: owner.timezone, services: activeServices }
}

export async function getPublicAvailability(slug: string, serviceId: string, date: string): Promise<string[]> {
  const parsed = publicAvailabilitySchema.safeParse({ slug, serviceId, date })
  if (!parsed.success) return []
  const owner = await getOwner(parsed.data.slug)
  if (!owner) return []
  const rows = await db.select({ durationMinutes: services.durationMinutes }).from(services)
    .where(and(eq(services.id, parsed.data.serviceId), eq(services.userId, owner.userId), eq(services.status, 'active')))
  const service = rows[0]
  if (!service) return []
  return (await getAvailableStarts(owner.userId, owner.timezone, service, parsed.data.date)).map((slot) => slot.toISOString())
}

export async function createPublicBooking(input: z.input<typeof bookingSchema>) {
  const parsed = bookingSchema.parse(input)
  const owner = await getOwner(parsed.slug)
  if (!owner) throw new Error('This booking page is no longer available.')
  const serviceRows = await db.select({ id: services.id, name: services.name, durationMinutes: services.durationMinutes }).from(services)
    .where(and(eq(services.id, parsed.serviceId), eq(services.userId, owner.userId), eq(services.status, 'active')))
  const service = serviceRows[0]
  if (!service) throw new Error('That service is no longer available.')

  const startsAt = new Date(parsed.startsAt)
  const date = formatInTimeZone(startsAt, owner.timezone, 'yyyy-MM-dd')
  const endsAt = new Date(startsAt.getTime() + service.durationMinutes * 60_000)
  const allowedStarts = await getAvailableStarts(owner.userId, owner.timezone, service, date)
  if (!allowedStarts.some((slot) => slot.getTime() === startsAt.getTime())) throw new Error('This time is no longer available. Please choose another slot.')

  const appointment = await db.transaction(async (tx) => {
    const conflicts = await tx.select({ id: appointments.id }).from(appointments)
      .where(and(eq(appointments.userId, owner.userId), eq(appointments.status, 'confirmed'), lt(appointments.startsAt, endsAt), gt(appointments.endsAt, startsAt)))
    if (conflicts.length) throw new Error('This time was just booked. Please choose another slot.')
      
      const normalizedEmail = parsed.customerEmail.trim().toLowerCase()
      const existingCustomer = await tx.select({ id: customers.id }).from(customers)
        .where(and(eq(customers.userId, owner.userId), eq(customers.email, normalizedEmail)))
      if (existingCustomer.length) {
        await tx.update(customers).set({ name: parsed.customerName, phone: parsed.customerPhone || '', lastBookingAt: new Date() })
          .where(eq(customers.id, existingCustomer[0].id))
      } else {
        await tx.insert(customers).values({
          id: `cus_${crypto.randomUUID()}`,
          userId: owner.userId,
          name: parsed.customerName,
          email: normalizedEmail,
          phone: parsed.customerPhone || '',
          notes: '',
          lastBookingAt: new Date(),
          createdAt: new Date(),
        })
      }
  
      const id = `apt_${crypto.randomUUID()}`
      const cancellationToken = crypto.randomUUID()
      await tx.insert(appointments).values({
      id,
      userId: owner.userId,
      customerName: parsed.customerName,
      customerEmail: parsed.customerEmail,
      customerPhone: parsed.customerPhone || null,
      serviceName: service.name,
      startsAt,
      endsAt,
      status: 'confirmed',
      cancellationToken,
      createdAt: new Date(),
    })
    return { id, cancellationToken }
  })
  revalidatePath(`/book/${owner.slug}`)

  const cancellationUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/cancel/${appointment.cancellationToken}`
  const whenLabel = formatInTimeZone(startsAt, owner.timezone, 'EEE, MMM d · h:mm a zzz')
  await sendEmail(parsed.customerEmail, 'Your appointment is confirmed', bookingConfirmedCustomerEmail(owner.businessName, service.name, whenLabel, cancellationUrl))
  try {
    const clerk = await clerkClient()
    const ownerUser = await clerk.users.getUser(owner.userId)
    const ownerEmail = ownerUser.emailAddresses[0]?.emailAddress
    if (ownerEmail) await sendEmail(ownerEmail, 'New booking received', bookingConfirmedOwnerEmail(parsed.customerName, service.name, whenLabel))
  } catch (error) {
    console.error('Could not notify owner by email', error)
  }

  return appointment
}