# Fixt Backend Implementation Guide

This document is the backend handoff for completing Fixt in a local VS Code/Codex workflow.

## 1. Current application state

The project is a Next.js 16 App Router application using TypeScript, Tailwind CSS, Drizzle ORM, PostgreSQL/Neon, and Zod.

Already present:

- Public booking UI: `/demo`
- Customer cancellation UI: `/cancel`
- Owner overview: `/dashboard`
- Owner services CRUD: `/dashboard/services`
- Owner bookings list/cancellation: `/dashboard/bookings`
- Owner availability editor: `/dashboard/availability`
- Owner onboarding UI: `/onboarding`
- Owner customer management: `/dashboard/customers`
- Neon tables created for appointments, services, availability, owner profiles, and customers
- Drizzle database client: `lib/db.ts`
- Temporary owner adapter: `lib/auth/owner.ts`

Important: the current owner adapter is still demo-only:

```ts
export function getOwnerId() {
  return process.env.FIXT_OWNER_ID ?? 'clerk_demo_owner'
}
```

All real backend work must replace this with Clerk authentication and must never trust a client-provided owner ID.

## 2. Required backend architecture

Use a modular monolith inside Next.js:

```text
app/
  actions/
    auth.ts
    onboarding.ts
    services.ts
    availability.ts
    bookings.ts
    customers.ts
    public-booking.ts
    notifications.ts
lib/
  db.ts
  db/schema.ts              # recommended next refactor from current lib/db.ts
  auth/owner.ts
  validation/
  email/
  errors/
```

Rules:

- Server Actions or Route Handlers are the HTTP boundary.
- Validate every input with Zod.
- Every owner query must scope by authenticated `userId`.
- Never accept `userId`/`ownerId` from the browser.
- Use transactions for booking creation and related customer updates.
- Use parameterized Drizzle queries only.
- Return safe user-facing errors; never expose stack traces or database errors.
- Add structured logging with request IDs for production.
- Add rate limiting to public booking and cancellation endpoints.

## 3. Environment variables

Already available through Neon:

```env
DATABASE_URL=
DATABASE_URL_UNPOOLED=
NEON_PROJECT_ID=
```

Add locally/Vercel when integrations are connected:

```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
RESEND_API_KEY=
RESEND_FROM_EMAIL=bookings@your-domain.com
```

Do not commit real secrets. Add an `.env.example` with empty or dummy values.

## 4. Clerk authentication implementation

Install and configure Clerk according to the current Clerk Next.js documentation.

Required work:

1. Add `@clerk/nextjs`.
2. Wrap the root layout with `ClerkProvider`.
3. Add Clerk middleware/proxy for protected owner routes.
4. Protect:
   - `/dashboard(.*)`
   - `/onboarding`
   - owner server actions
5. Keep `/`, `/demo`, `/cancel`, and public booking routes accessible without owner authentication.
6. Replace `lib/auth/owner.ts` with:

```ts
import { auth } from '@clerk/nextjs/server'

export async function requireOwnerId() {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')
  return userId
}
```

7. Make every owner action async-call `await requireOwnerId()`.
8. Remove `FIXT_OWNER_ID` and `clerk_demo_owner` fallback from production code.
9. Add sign-in/sign-up routes or Clerk hosted components.
10. Redirect authenticated owners without completed profiles to `/onboarding`.

Use `auth().userId` only on the server. Do not put Clerk secret keys in client components.

## 5. Database model and constraints

Current tables:

### `fixt_owner_profiles`

- `user_id` primary key
- `business_name`
- `slug` unique
- `timezone`
- `onboarding_complete`
- `updated_at`

Add:

- `created_at`
- `email` or owner contact fields if needed
- `cancellation_policy`
- `booking_notice_minutes`
- `buffer_minutes`

### `fixt_services`

- `id` primary key
- `user_id`
- `name`
- `description`
- `duration_minutes`
- `price_cents`
- `status`: `active | archived`
- `created_at`
- `updated_at`

Add indexes:

```sql
CREATE INDEX fixt_services_user_status_idx
ON fixt_services(user_id, status);
```

### `fixt_availability`

- `id` primary key
- `user_id`
- `weekday`: `0` Sunday through `6` Saturday
- `start_time`
- `end_time`
- `enabled`

Add a unique constraint on `(user_id, weekday)` and validate `start_time < end_time`.

### `fixt_customers`

- `id` primary key
- `user_id`
- `name`
- `email`
- `phone`
- `notes`
- `last_booking_at`
- `created_at`

Add:

- `updated_at`
- normalized lowercase email
- index on `(user_id, email)`
- optional soft-delete field

### `fixt_appointments`

Current fields:

- `id`
- `user_id`
- `customer_name`
- `customer_email`
- `service_name`
- `starts_at`
- `ends_at`
- `status`
- `created_at`

For production, add:

- `service_id`
- `customer_id`
- `customer_phone`
- `customer_notes`
- `booking_reference` unique and public-safe
- `cancellation_reference`
- `cancelled_at`
- `cancelled_by`: `customer | owner | system`
- `updated_at`
- `timezone`
- `reschedule_token_hash` if rescheduling is added

Use status enum values:

```text
confirmed
completed
cancelled
no_show
```

Recommended indexes:

```sql
CREATE INDEX fixt_appointments_owner_start_idx
ON fixt_appointments(user_id, starts_at);

CREATE INDEX fixt_appointments_owner_status_idx
ON fixt_appointments(user_id, status);

CREATE UNIQUE INDEX fixt_appointments_booking_reference_idx
ON fixt_appointments(booking_reference);
```

## 6. Public booking backend

The current `/demo` screen uses local mock data. Implement a dynamic public route:

```text
/[slug]
/[slug]/confirmation/[bookingReference]
```

### Public read endpoint/action

`GET /api/public/providers/:slug`

Return only public fields:

```ts
{
  business: {
    name: string
    slug: string
    timezone: string
  }
  services: Array<{
    id: string
    name: string
    description: string
    durationMinutes: number
    priceCents: number
  }>
}
```

Do not return owner IDs, private notes, customer records, or internal database IDs unless they are public-safe.

### Availability endpoint

`GET /api/public/providers/:slug/availability?serviceId=...&date=YYYY-MM-DD`

Server logic:

1. Resolve provider by slug.
2. Resolve active service owned by provider.
3. Convert date using the provider timezone.
4. Load weekday availability.
5. Generate slots from start/end time using service duration and buffer.
6. Exclude existing appointments with overlapping intervals.
7. Exclude slots inside the minimum booking notice window.
8. Return slots with ISO timestamps and display labels.

Never calculate authoritative availability only in the browser.

### Booking creation endpoint

`POST /api/public/bookings`

Input:

```ts
{
  slug: string
  serviceId: string
  startsAt: string
  customer: {
    name: string
    email: string
    phone?: string
    notes?: string
  }
}
```

Validation:

- valid provider slug
- active service belongs to provider
- valid ISO datetime
- slot is in provider timezone and matches an offered slot
- name length 2–100
- normalized valid email
- phone length and format if supplied
- notes max length
- booking is not in the past
- booking satisfies notice period

Use a transaction and protect against race conditions:

1. Re-check availability inside the transaction.
2. Insert the appointment.
3. Upsert the customer by `(user_id, normalized_email)`.
4. Update `last_booking_at`.
5. Generate a non-guessable public booking reference.
6. Commit.
7. Trigger confirmation email after commit.

Return:

```ts
{
  bookingReference: string
  businessName: string
  serviceName: string
  startsAt: string
  endsAt: string
  timezone: string
}
```

If the slot was taken, return HTTP `409` with a safe message and refreshed availability.

## 7. Customer cancellation backend

The current `/cancel` flow is local mock data. Implement:

```text
GET /api/public/bookings/lookup
POST /api/public/bookings/:bookingReference/cancel
```

Lookup should require two factors:

- booking reference
- customer email

Never allow cancellation by reference alone.

Cancellation rules:

- normalize email before comparing
- only expose limited appointment details after successful lookup
- reject already-cancelled bookings with an idempotent response
- reject completed/no-show bookings
- enforce cancellation window from owner policy
- store `cancelled_at` and `cancelled_by = customer`
- do not physically delete appointments
- send cancellation email after commit

Use a transaction and owner/customer scoping. Return generic lookup errors so attackers cannot enumerate valid references.

## 8. Owner dashboard backend

Existing owner screens should be converted to authenticated data:

### Overview

Return:

- today appointment count
- upcoming appointment count
- confirmed count
- cancelled count
- next appointments
- profile completion status

### Services

Existing operations:

- `getOwnerServices`
- `createService`
- `updateService`
- `archiveService`

Required improvements:

- require Clerk user ID
- prevent duplicate active service names per owner
- never hard-delete services referenced by appointments
- reject archive if business policy does not permit it, or preserve historical references
- use `updateTag`/`revalidatePath` after writes

### Availability

Existing operations must:

- validate weekday 0–6
- validate HH:mm format
- reject end time before start time
- support disabled days
- support multiple windows per day if required by PRD
- prevent overlapping availability windows
- use provider timezone consistently

### Bookings

Existing operations:

- list owner bookings
- filter by status/date
- cancel owner booking

Required improvements:

- support pagination
- add date range filtering server-side
- add customer/service joins
- use status transitions rather than arbitrary status updates
- audit who changed the status
- revalidate dashboard, bookings, and customer paths

### Customers

Required operations:

- list/search owner customers
- view customer details
- update notes/contact information
- show booking history
- prevent cross-owner access
- paginate large customer lists

## 9. Owner onboarding backend

Onboarding should be a server action or route handler with a Zod schema:

```ts
{
  businessName: string
  slug: string
  timezone: string
}
```

Rules:

- slug lowercase, URL-safe, 3–50 chars
- slug uniqueness check
- reserve blocked/system slugs
- upsert owner profile using authenticated Clerk ID
- mark onboarding complete only after required fields validate
- initialize default availability only once
- redirect to `/dashboard`

## 10. Resend email notifications

Resend was skipped in the current project, but production backend needs:

Templates:

1. booking confirmation to customer
2. booking notification to owner
3. customer cancellation confirmation
4. owner cancellation notification
5. optional reminder email

Implement `lib/email/resend.ts` with:

- server-only API key usage
- validated sender address
- reusable templates
- no raw user HTML injection
- idempotency key per booking/event
- retry strategy for transient failures
- logging without secrets or message contents containing sensitive data

Email sends should run after database commit. Use an outbox table or background job for reliable delivery.

Recommended outbox fields:

```text
id
user_id
event_type
aggregate_id
payload_json
status
attempts
next_attempt_at
sent_at
created_at
```

## 11. Security requirements

- Clerk authentication on all owner routes/actions.
- Public booking endpoints rate-limited by IP and provider slug.
- Cancellation lookup rate-limited and generic on failure.
- Validate and normalize emails.
- Never expose database errors or SQL details.
- Never log passwords, auth tokens, API keys, or full customer PII.
- Add security headers in `next.config`.
- Add CSRF protection where needed for cookie-authenticated mutations.
- Use HTTPS in production.
- Add audit log for owner mutations and status transitions.
- Use least-privilege database credentials.

## 12. API error contract

Use a consistent response shape:

```ts
{
  error: {
    code: string
    message: string
    requestId: string
    fieldErrors?: Record<string, string[]>
  }
}
```

Suggested codes:

```text
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
VALIDATION_ERROR
SLOT_UNAVAILABLE
BOOKING_ALREADY_CANCELLED
CANCELLATION_WINDOW_CLOSED
CONFLICT
RATE_LIMITED
INTERNAL_ERROR
```

## 13. Testing checklist

### Unit tests

- slug normalization
- service validation
- availability slot generation
- timezone conversion
- overlap detection
- cancellation policy
- status transition rules
- email template rendering

### Integration tests

- owner A cannot read owner B data
- owner A cannot update owner B service/booking/customer
- public provider lookup returns only public data
- booking creation creates customer and appointment atomically
- duplicate slot booking returns `409`
- cancellation requires correct reference and email
- already cancelled booking is idempotent
- archived services cannot be booked

### E2E tests

1. Owner signs in.
2. Owner completes onboarding.
3. Owner creates service.
4. Owner configures availability.
5. Customer opens `/:slug`.
6. Customer selects service and slot.
7. Customer books appointment.
8. Confirmation email is queued/sent.
9. Customer looks up booking.
10. Customer cancels within policy.
11. Owner sees cancelled appointment and customer history.

## 14. Local development commands

```bash
pnpm install
pnpm dev
pnpm build
pnpm start
```

Recommended additions to `package.json`:

```json
{
  "scripts": {
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:e2e": "playwright test"
  }
}
```

## 15. Recommended implementation order

1. Replace demo Clerk adapter with real Clerk auth.
2. Move schema into `lib/db/schema.ts` and add indexes/constraints through migration tooling.
3. Complete owner profile/onboarding persistence and slug uniqueness.
4. Implement server-authoritative availability generation.
5. Implement public provider lookup and dynamic booking route.
6. Implement transactional booking creation with conflict protection.
7. Implement secure cancellation lookup and cancellation mutation.
8. Add customer booking history and owner joins.
9. Add Resend outbox and email workers.
10. Add rate limiting, audit logging, security headers, tests, and monitoring.

## 16. Definition of done

Backend is ready when:

- Clerk authentication is real and no demo owner fallback remains.
- Every owner query is scoped to the authenticated Clerk user ID.
- Public booking works from provider slug through persisted appointment.
- Availability is generated server-side with timezone and overlap correctness.
- Booking creation is transactional and race-safe.
- Customer cancellation requires reference plus email and respects policy.
- Services, availability, bookings, customers, and onboarding persist correctly.
- Emails are queued reliably through Resend/outbox processing.
- Unit, integration, and E2E tests pass.
- Production build, typecheck, security review, and migration checks pass.
