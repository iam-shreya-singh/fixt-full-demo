'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock3, MapPin, TriangleAlert } from 'lucide-react'
import { business } from './booking-data'
import { cancellationPolicy, isMatchingBooking, makeCancellationReference, sampleBooking } from './cancellation-data'
import { cancelBooking, type PublicBooking } from '@/app/actions/cancellation'

type Form = { reference: string; email: string }

export function CustomerCancellationPage() {
  const [step, setStep] = useState<'lookup' | 'review' | 'cancelled'>('lookup')
  const [form, setForm] = useState<Form>({ reference: sampleBooking.reference, email: sampleBooking.email })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [cancellationReference, setCancellationReference] = useState('')

  function lookup() {
    if (!form.reference.trim() || !form.email.trim()) {
      setError('Enter your booking reference and email to find the appointment.')
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setError('Please enter a valid email address.')
      return
    }
    setError('')
    setIsLoading(true)
    window.setTimeout(() => {
      setIsLoading(false)
      if (isMatchingBooking(form.reference, form.email)) setStep('review')
      else setError('We could not find an appointment matching those details. Check your reference and email, then try again.')
    }, 500)
  }

  function cancel() {
    setIsLoading(true)
    window.setTimeout(() => {
      setCancellationReference(makeCancellationReference())
      setIsLoading(false)
      setStep('cancelled')
    }, 650)
  }

  if (step === 'cancelled') return <CancellationSuccess reference={cancellationReference} />
  if (step === 'review') return <ReviewState isLoading={isLoading} onBack={() => setStep('lookup')} onCancel={cancel} />

  return <main className="min-h-screen bg-fixt-paper text-fixt-ink">
    <Header />
    <div className="mx-auto grid max-w-6xl gap-12 px-5 py-10 md:grid-cols-[1fr_340px] md:px-8 md:py-16">
      <section className="max-w-xl">
        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-fixt-amber">Manage your appointment</p>
        <h1 className="text-balance font-serif text-5xl leading-[0.98] tracking-[-0.055em] md:text-7xl">Plans change. That&apos;s alright.</h1>
        <p className="mt-6 max-w-md text-sm leading-6 text-fixt-muted">Find your appointment below to review the details and cancel your booking.</p>
        <div className="mt-12"><SectionLabel>01 / Find your booking</SectionLabel><div className="max-w-md space-y-5"><Field label="Booking reference" value={form.reference} placeholder="FXT-7K4M2Q" onChange={(value) => setForm({ ...form, reference: value })} /><Field label="Email address" type="email" value={form.email} placeholder="you@example.com" onChange={(value) => setForm({ ...form, email: value })} />{error && <p role="alert" className="border-l-2 border-fixt-amber bg-fixt-wash px-3 py-2 text-sm leading-5">{error}</p>}<button disabled={isLoading} onClick={lookup} className="inline-flex w-full items-center justify-center gap-2 bg-fixt-ink px-5 py-4 font-mono text-[11px] uppercase tracking-[0.14em] text-fixt-paper transition-opacity hover:opacity-85 disabled:cursor-wait disabled:opacity-60">{isLoading ? 'Finding appointment…' : 'Find appointment'} {!isLoading && <ArrowRight className="size-4" strokeWidth={1.5} />}</button></div></div>
      </section>
      <SideNote />
    </div>
  </main>
}

function ReviewState({ isLoading, onBack, onCancel }: { isLoading: boolean; onBack: () => void; onCancel: () => void }) {
  return <main className="min-h-screen bg-fixt-paper text-fixt-ink"><Header /><div className="mx-auto max-w-3xl px-5 py-10 md:px-8 md:py-16"><button onClick={onBack} className="mb-10 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-fixt-muted hover:text-fixt-ink"><ArrowLeft className="size-4" strokeWidth={1.5} /> Use different details</button><SectionLabel>02 / Review cancellation</SectionLabel><h1 className="max-w-xl text-balance font-serif text-5xl leading-[0.98] tracking-[-0.055em] md:text-7xl">Are you sure you want to cancel?</h1><p className="mt-6 max-w-md text-sm leading-6 text-fixt-muted">This will release your appointment time. You can always book another visit later.</p><div className="mt-12 grid border-y border-fixt-line md:grid-cols-2"><div className="border-b border-fixt-line py-6 md:border-b-0 md:border-r md:pr-8"><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-fixt-muted">Appointment</p><p className="mt-3 font-serif text-2xl">{sampleBooking.service.name}</p><p className="mt-1 font-mono text-xs text-fixt-muted">{sampleBooking.dateLabel} · {sampleBooking.time}</p><p className="mt-1 text-sm text-fixt-muted">{sampleBooking.service.duration} minutes · {sampleBooking.timezone}</p></div><div className="py-6 md:pl-8"><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-fixt-muted">Where we are</p><p className="mt-3 text-sm leading-6">{sampleBooking.location}</p><p className="mt-1 text-sm text-fixt-muted">{sampleBooking.provider}</p></div></div><div className="mt-8 flex gap-3 border border-fixt-line bg-fixt-wash p-4"><TriangleAlert className="mt-0.5 size-4 shrink-0 text-fixt-amber" strokeWidth={1.5} /><p className="text-sm leading-5">{cancellationPolicy}</p></div><div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center"><button disabled={isLoading} onClick={onCancel} className="inline-flex items-center justify-center gap-2 bg-fixt-amber px-5 py-4 font-mono text-[11px] uppercase tracking-[0.14em] text-fixt-ink hover:opacity-85 disabled:cursor-wait disabled:opacity-60">{isLoading ? 'Cancelling appointment…' : 'Yes, cancel appointment'} <ArrowRight className="size-4" strokeWidth={1.5} /></button><button onClick={onBack} className="px-5 py-4 font-mono text-[11px] uppercase tracking-[0.14em] text-fixt-muted hover:text-fixt-ink">Keep appointment</button></div></div></main>
}

function CancellationSuccess({ reference }: { reference: string }) {
  return <main className="min-h-screen bg-fixt-paper text-fixt-ink"><Header /><div className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-24"><div className="mb-12 flex size-12 items-center justify-center bg-fixt-amber text-fixt-ink"><Check className="size-6" strokeWidth={1.5} /></div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-fixt-amber">Appointment cancelled</p><h1 className="mt-4 max-w-xl text-balance font-serif text-5xl leading-[0.98] tracking-[-0.055em] md:text-7xl">You&apos;re all set.</h1><p className="mt-6 max-w-md text-sm leading-6 text-fixt-muted">A cancellation confirmation has been prepared for {sampleBooking.email}.</p><div className="mt-12 grid border-y border-fixt-line md:grid-cols-2"><div className="border-b border-fixt-line py-6 md:border-b-0 md:border-r md:pr-8"><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-fixt-muted">Cancelled appointment</p><p className="mt-3 font-serif text-2xl">{sampleBooking.service.name}</p><p className="mt-1 font-mono text-xs text-fixt-muted">{sampleBooking.dateLabel} · {sampleBooking.time}</p></div><div className="py-6 md:pl-8"><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-fixt-muted">Cancellation reference</p><p className="mt-3 font-mono text-2xl tracking-[0.08em]">{reference}</p></div></div><a href="/demo" className="mt-10 inline-flex items-center gap-2 bg-fixt-ink px-5 py-4 font-mono text-[11px] uppercase tracking-[0.14em] text-fixt-paper hover:opacity-85">Book another appointment <ArrowRight className="size-4" strokeWidth={1.5} /></a></div></main>
}

function formatDateLabel(iso: string) {
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date(iso))
}
function formatTimeLabel(iso: string) {
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(iso))
}

export function TokenCancellationPage({ token, booking }: { token: string; booking: PublicBooking }) {
  const [step, setStep] = useState<'review' | 'cancelled'>(booking.status === 'cancelled' ? 'cancelled' : 'review')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function cancel() {
    setIsLoading(true)
    setError('')
    try {
      await cancelBooking(token)
      setStep('cancelled')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not cancel this appointment.')
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 'cancelled') return <main className="min-h-screen bg-fixt-paper text-fixt-ink"><header className="border-b border-fixt-line"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8"><div className="font-serif text-xl tracking-[-0.03em]">{booking.businessName}</div><div className="font-mono text-[10px] uppercase tracking-[0.16em] text-fixt-muted">Appointment support</div></div></header><div className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-24"><div className="mb-12 flex size-12 items-center justify-center bg-fixt-amber text-fixt-ink"><Check className="size-6" strokeWidth={1.5} /></div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-fixt-amber">Appointment cancelled</p><h1 className="mt-4 max-w-xl text-balance font-serif text-5xl leading-[0.98] tracking-[-0.055em] md:text-7xl">You&apos;re all set.</h1><p className="mt-6 max-w-md text-sm leading-6 text-fixt-muted">{booking.serviceName} on {formatDateLabel(booking.startsAt)} has been cancelled.</p></div></main>

  return <main className="min-h-screen bg-fixt-paper text-fixt-ink"><header className="border-b border-fixt-line"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8"><div className="font-serif text-xl tracking-[-0.03em]">{booking.businessName}</div><div className="font-mono text-[10px] uppercase tracking-[0.16em] text-fixt-muted">Appointment support</div></div></header><div className="mx-auto max-w-3xl px-5 py-10 md:px-8 md:py-16"><SectionLabel>Review cancellation</SectionLabel><h1 className="max-w-xl text-balance font-serif text-5xl leading-[0.98] tracking-[-0.055em] md:text-7xl">Are you sure you want to cancel?</h1><p className="mt-6 max-w-md text-sm leading-6 text-fixt-muted">This will release your appointment time.</p><div className="mt-12 border-y border-fixt-line py-6"><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-fixt-muted">Appointment</p><p className="mt-3 font-serif text-2xl">{booking.serviceName}</p><p className="mt-1 font-mono text-xs text-fixt-muted">{formatDateLabel(booking.startsAt)} · {formatTimeLabel(booking.startsAt)}</p></div>{error && <p role="alert" className="mt-6 border-l-2 border-fixt-amber bg-fixt-wash px-3 py-2 text-sm leading-5">{error}</p>}<div className="mt-10"><button disabled={isLoading} onClick={cancel} className="inline-flex items-center justify-center gap-2 bg-fixt-amber px-5 py-4 font-mono text-[11px] uppercase tracking-[0.14em] text-fixt-ink hover:opacity-85 disabled:cursor-wait disabled:opacity-60">{isLoading ? 'Cancelling…' : 'Yes, cancel appointment'} <ArrowRight className="size-4" strokeWidth={1.5} /></button></div></div></main>
}

function Header() { return <header className="border-b border-fixt-line"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8"><div className="font-serif text-xl tracking-[-0.03em]">{business.name}</div><div className="font-mono text-[10px] uppercase tracking-[0.16em] text-fixt-muted">Appointment support</div></div></header> }
function SideNote() { return <aside className="h-fit border-t border-fixt-line pt-5 md:sticky md:top-8"><div className="flex items-start gap-3"><CalendarDays className="mt-0.5 size-4 text-fixt-amber" strokeWidth={1.5} /><div><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-fixt-muted">Your booking email</p><p className="mt-1 text-sm">Use the same email you entered at booking.</p></div></div><div className="mt-6 flex items-start gap-3"><Clock3 className="mt-0.5 size-4 text-fixt-amber" strokeWidth={1.5} /><div><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-fixt-muted">Need a hand?</p><p className="mt-1 text-sm">Contact the studio if your plans have changed unexpectedly.</p></div></div></aside> }
function SectionLabel({ children }: { children: React.ReactNode }) { return <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.18em] text-fixt-muted">{children}</p> }
function Field({ label, value, placeholder, onChange, type = 'text' }: { label: string; value: string; placeholder: string; onChange: (value: string) => void; type?: string }) { return <label className="block"><span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.14em] text-fixt-muted">{label}</span><input type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="w-full border-b border-fixt-line bg-transparent px-0 py-3 text-sm outline-none transition-colors placeholder:text-fixt-muted focus:border-fixt-amber" /></label> }