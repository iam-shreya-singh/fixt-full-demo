import { drizzle } from 'drizzle-orm/node-postgres'
import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { Pool } from 'pg'

export const services = pgTable('fixt_services', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  priceCents: integer('price_cents').notNull(),
  status: text('status').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
})

export const appointments = pgTable('fixt_appointments', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  serviceName: text('service_name').notNull(),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
  status: text('status').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
})

const globalForDb = globalThis as unknown as { fixtPool?: Pool }
const pool = globalForDb.fixtPool ?? new Pool({ connectionString: process.env.DATABASE_URL })
if (process.env.NODE_ENV !== 'production') globalForDb.fixtPool = pool

export const db = drizzle(pool)
