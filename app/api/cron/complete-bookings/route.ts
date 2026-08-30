import { and, eq, lt } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { appointments, db } from '@/lib/db'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  const result = await db.update(appointments)
    .set({ status: 'completed' })
    .where(and(eq(appointments.status, 'confirmed'), lt(appointments.endsAt, new Date())))
  return NextResponse.json({ ok: true })
}