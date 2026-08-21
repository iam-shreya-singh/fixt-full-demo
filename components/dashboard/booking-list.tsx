'use client'

import { useMemo, useState, useTransition } from 'react'
import { cancelOwnerBooking, type OwnerBooking } from '@/app/actions/bookings'

type Props = { initialBookings: OwnerBooking[] }
const statuses = ['all', 'confirmed', 'completed', 'cancelled', 'no-show']

function formatDate(value: string) { return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date(value)) }
function formatTime(value: string) { return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(value)) }
function statusClass(status: string) { return status === 'confirmed' ? 'text-fixt-ink' : status === 'cancelled' ? 'text-fixt-muted' : 'text-fixt-amber' }

export function BookingList({ initialBookings }: Props) {
  const [bookings, setBookings] = useState(initialBookings)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState<OwnerBooking | null>(null)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const visible = useMemo(() => filter === 'all' ? bookings : bookings.filter((booking) => booking.status === filter), [bookings, filter])

  function cancel() {
    if (!selected) return
    startTransition(async () => {
      try {
        await cancelOwnerBooking(selected.id)
        setBookings((items) => items.map((item) => item.id === selected.id ? { ...item, status: 'cancelled' } : item))
        setSelected(null)
      } catch (err) { setError(err instanceof Error ? err.message : 'Unable to cancel booking.') }
    })
  }

  return <main className="min-h-screen bg-fixt-paper text-fixt-ink"><div className="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-12"><header className="mb-8 border-b border-fixt-line pb-7"><p className="font-mono text-[11px] uppercase tracking-[0.22em] text-fixt-muted">Owner / bookings</p><h1 className="mt-3 font-serif text-4xl tracking-tight md:text-5xl">Appointments</h1><p className="mt-3 max-w-xl text-sm leading-6 text-fixt-muted">Every booking in one quiet, chronological view. Open a record to see the details or cancel it.</p></header><div className="mb-7 flex flex-wrap gap-2" aria-label="Filter appointments">{statuses.map((status) => <button key={status} type="button" onClick={() => setFilter(status)} className={`border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.15em] transition-colors ${filter === status ? 'border-fixt-ink bg-fixt-ink text-fixt-paper' : 'border-fixt-line text-fixt-muted hover:border-fixt-ink hover:text-fixt-ink'}`}>{status}</button>)}</div>{error && <p role="alert" className="mb-5 border border-fixt-amber p-3 text-sm">{error}</p>}{visible.length ? <div className="divide-y divide-fixt-line border-y border-fixt-line">{visible.map((booking) => <button key={booking.id} type="button" onClick={() => setSelected(booking)} className="grid w-full gap-4 py-5 text-left transition-colors hover:bg-fixt-wash md:grid-cols-[1fr_1.3fr_1fr_auto] md:items-center"><div><p className="font-serif text-xl">{booking.customerName}</p><p className="mt-1 text-sm text-fixt-muted">{booking.customerEmail}</p></div><div><p className="text-sm">{booking.serviceName}</p><p className="mt-1 font-mono text-xs text-fixt-muted">{formatDate(booking.startsAt)} · {formatTime(booking.startsAt)}–{formatTime(booking.endsAt)}</p></div><p className="font-mono text-xs text-fixt-muted">{booking.id}</p><span className={`font-mono text-[10px] uppercase tracking-widest ${statusClass(booking.status)}`}>{booking.status}</span></button>)}</div> : <div className="border-y border-fixt-line py-16 text-center"><p className="font-serif text-2xl">No appointments here.</p><p className="mt-2 text-sm text-fixt-muted">Try another status filter or wait for the next booking.</p></div>}{selected && <div className="fixed inset-0 z-20 flex items-end justify-center bg-fixt-ink/30 p-4 md:items-center"><section role="dialog" aria-modal="true" aria-labelledby="booking-detail-title" className="w-full max-w-lg border border-fixt-line bg-fixt-paper p-6 shadow-xl md:p-8"><div className="flex items-start justify-between gap-4"><div><p className="font-mono text-[11px] uppercase tracking-[0.2em] text-fixt-muted">Booking detail</p><h2 id="booking-detail-title" className="mt-2 font-serif text-3xl">{selected.customerName}</h2></div><button type="button" onClick={() => setSelected(null)} className="font-mono text-xs text-fixt-muted underline underline-offset-4">Close</button></div><dl className="mt-7 divide-y divide-fixt-line border-y border-fixt-line text-sm"><div className="flex justify-between gap-4 py-3"><dt className="text-fixt-muted">Service</dt><dd>{selected.serviceName}</dd></div><div className="flex justify-between gap-4 py-3"><dt className="text-fixt-muted">When</dt><dd className="font-mono text-xs">{formatDate(selected.startsAt)} · {formatTime(selected.startsAt)}–{formatTime(selected.endsAt)}</dd></div><div className="flex justify-between gap-4 py-3"><dt className="text-fixt-muted">Status</dt><dd className="font-mono text-xs uppercase">{selected.status}</dd></div></dl>{selected.status === 'confirmed' && <button type="button" disabled={isPending} onClick={cancel} className="mt-7 w-full border border-fixt-ink bg-fixt-ink px-4 py-3 text-sm text-fixt-paper transition-colors hover:bg-fixt-amber hover:text-fixt-ink disabled:opacity-60">{isPending ? 'Cancelling…' : 'Cancel appointment'}</button>}</section></div>}</div></main>
}
