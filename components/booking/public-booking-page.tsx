'use client'

import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock3, Copy, MapPin, ShieldCheck } from 'lucide-react'
import { availability, business, dates, getDateLabel, getSlot, makeReference, services, type Service } from './booking-data'

type Step = 'service' | 'time' | 'details' | 'confirmed'

type FormState = { name: string; email: string; phone: string }

export function PublicBookingPage() {
  const [step, setStep] = useState<Step>('service')
  const [service, setService] = useState<Service | null>(null)
  const [date, setDate] = useState(dates[0].id)
  const [slot, setSlot] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>({ name: '', email: '', phone: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reference, setReference] = useState('')

  const slots = useMemo(() => availability[date] ?? [], [date])
  const selectedSlot = slot ? getSlot(slot, date) : undefined

  function chooseService(next: Service) {
    setService(next)
    setError('')
    setStep('time')
  }

  function chooseDate(next: string) {
    setDate(next)
    setSlot(null)
    setError('')
  }

  function submit() {
    if (!form.name.trim() || !form.email.trim()) {
      setError('Please add your name and email to continue.')
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setError('Please enter a valid email address.')
      return
    }
    if (!service || !selectedSlot) return
    setError('')
    setIsSubmitting(true)
    window.setTimeout(() => {
      setReference(makeReference())
      setIsSubmitting(false)
      setStep('confirmed')
    }, 650)
  }

  function startOver() {
    setStep('service')
    setService(null)
    setSlot(null)
    setReference('')
    setError('')
  }

  if (step === 'confirmed') {
    return <Confirmation service={service!} date={date} slot={selectedSlot!.time} reference={reference} form={form} onStartOver={startOver} />
  }

  return (
    <main className="min-h-screen bg-fixt-paper text-fixt-ink">
      <header className="border-b border-fixt-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8">
          <div className="font-serif text-xl tracking-[-0.03em]">{business.name}</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-fixt-muted">Book an appointment</div>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-10 md:grid-cols-[1fr_340px] md:px-8 md:py-16">
        <section>
          <div className="mb-10 max-w-xl">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-fixt-amber">{step === 'service' ? 'Make some time' : step === 'time' ? 'Choose a time' : 'Almost there'}</p>
            <h1 className="text-balance font-serif text-5xl leading-[0.98] tracking-[-0.055em] md:text-7xl">A little time, set aside.</h1>
            <p className="mt-6 max-w-md text-sm leading-6 text-fixt-muted">{business.description}</p>
          </div>

          {step === 'service' && <ServiceStep selected={service?.id} onSelect={chooseService} />}
          {step === 'time' && <TimeStep date={date} dates={dates} slots={slots} selectedSlot={slot} onDate={chooseDate} onSlot={(id) => { setSlot(id); setError(''); setStep('details') }} onBack={() => setStep('service')} />}
          {step === 'details' && <DetailsStep service={service!} date={date} slot={selectedSlot!} form={form} error={error} isSubmitting={isSubmitting} onChange={(key, value) => setForm((current) => ({ ...current, [key]: value }))} onBack={() => setStep('time')} onSubmit={submit} />}
        </section>
        <aside className="h-fit border-t border-fixt-line pt-5 md:sticky md:top-8">
          <div className="flex items-start gap-3"><Clock3 className="mt-0.5 size-4 text-fixt-amber" strokeWidth={1.5} /><div><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-fixt-muted">Local time</p><p className="mt-1 text-sm">{business.timezoneLabel} <span className="text-fixt-muted">({business.timezone})</span></p></div></div>
          <div className="mt-6 flex items-start gap-3"><MapPin className="mt-0.5 size-4 text-fixt-amber" strokeWidth={1.5} /><div><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-fixt-muted">Where we are</p><p className="mt-1 text-sm">{business.address}</p></div></div>
          <div className="mt-8 border-t border-fixt-line pt-5 text-xs leading-5 text-fixt-muted">No account required. You&apos;ll receive everything you need by email.</div>
        </aside>
      </div>
    </main>
  )
}

function ServiceStep({ selected, onSelect }: { selected?: string; onSelect: (service: Service) => void }) {
  return <div><SectionLabel>01 / Service</SectionLabel><div className="divide-y divide-fixt-line border-y border-fixt-line">{services.map((item) => <button key={item.id} onClick={() => onSelect(item)} className={`group flex w-full items-center justify-between gap-5 py-5 text-left transition-colors hover:bg-fixt-wash ${selected === item.id ? 'bg-fixt-wash' : ''}`}><span><span className="block font-serif text-2xl tracking-[-0.03em]">{item.name}</span><span className="mt-1 block max-w-md text-sm leading-5 text-fixt-muted">{item.description}</span><span className="mt-3 block font-mono text-[10px] uppercase tracking-[0.12em] text-fixt-muted">{item.duration} min · {item.price}</span></span><ArrowRight className="size-5 shrink-0 text-fixt-amber transition-transform group-hover:translate-x-1" strokeWidth={1.5} /></button>)}</div></div>
}

function TimeStep({ date, dates: dateOptions, slots, selectedSlot, onDate, onSlot, onBack }: { date: string; dates: typeof dates; slots: typeof availability[string]; selectedSlot: string | null; onDate: (date: string) => void; onSlot: (slot: string) => void; onBack: () => void }) {
  return <div><button onClick={onBack} className="mb-8 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-fixt-muted hover:text-fixt-ink"><ArrowLeft className="size-4" strokeWidth={1.5} /> Back to services</button><SectionLabel>02 / Date & time</SectionLabel><div className="mb-8 flex gap-2 overflow-x-auto pb-2">{dateOptions.map((item) => <button key={item.id} onClick={() => onDate(item.id)} className={`min-w-[76px] border px-3 py-3 text-center transition-colors ${date === item.id ? 'border-fixt-ink bg-fixt-ink text-fixt-paper' : 'border-fixt-line hover:border-fixt-ink'}`}><span className="block font-mono text-[10px] uppercase tracking-[0.12em] opacity-70">{item.weekday}</span><span className="mt-1 block font-serif text-2xl">{item.day}</span><span className="block font-mono text-[10px] uppercase opacity-70">{item.month}</span></button>)}</div>{slots.length === 0 ? <div className="border border-dashed border-fixt-line px-6 py-10 text-center"><CalendarDays className="mx-auto mb-3 size-5 text-fixt-muted" strokeWidth={1.5} /><p className="font-serif text-2xl">A quiet day.</p><p className="mt-2 text-sm text-fixt-muted">There are no appointments available on this date. Try another.</p></div> : <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{slots.map((item) => <button key={item.id} onClick={() => onSlot(item.id)} className={`border px-4 py-4 text-left font-mono text-xs transition-colors hover:border-fixt-ink ${selectedSlot === item.id ? 'border-fixt-amber bg-fixt-amber/10' : 'border-fixt-line'}`}>{item.time}</button>)}</div>}</div>
}

function DetailsStep({ service, date, slot, form, error, isSubmitting, onChange, onBack, onSubmit }: { service: Service; date: string; slot: { id: string; time: string }; form: FormState; error: string; isSubmitting: boolean; onChange: (key: keyof FormState, value: string) => void; onBack: () => void; onSubmit: () => void }) {
  return <div><button onClick={onBack} className="mb-8 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-fixt-muted hover:text-fixt-ink"><ArrowLeft className="size-4" strokeWidth={1.5} /> Change time</button><SectionLabel>03 / Your details</SectionLabel><div className="mb-8 border-y border-fixt-line py-5"><div className="flex items-center justify-between gap-4"><div><p className="font-serif text-2xl">{service.name}</p><p className="mt-1 font-mono text-[11px] text-fixt-muted">{getDateLabel(date)} · {slot.time}</p></div><span className="font-mono text-xs">{service.price}</span></div></div><div className="max-w-md space-y-5"><Field label="Your name" value={form.name} onChange={(value) => onChange('name', value)} required /><Field label="Email address" type="email" value={form.email} onChange={(value) => onChange('email', value)} required /><Field label="Phone number" value={form.phone} onChange={(value) => onChange('phone', value)} hint="Optional" />{error && <p role="alert" className="border-l-2 border-fixt-amber bg-fixt-wash px-3 py-2 text-sm">{error}</p>}<button disabled={isSubmitting} onClick={onSubmit} className="inline-flex w-full items-center justify-center gap-2 bg-fixt-ink px-5 py-4 font-mono text-[11px] uppercase tracking-[0.14em] text-fixt-paper transition-opacity hover:opacity-85 disabled:cursor-wait disabled:opacity-60">{isSubmitting ? 'Holding your time…' : 'Confirm appointment'} {!isSubmitting && <ArrowRight className="size-4" strokeWidth={1.5} />}</button></div></div>
}

function Confirmation({ service, date, slot, reference, form, onStartOver }: { service: Service; date: string; slot: string; reference: string; form: FormState; onStartOver: () => void }) {
  return <main className="min-h-screen bg-fixt-paper text-fixt-ink"><header className="border-b border-fixt-line"><div className="mx-auto max-w-6xl px-5 py-5 md:px-8"><div className="font-serif text-xl tracking-[-0.03em]">{business.name}</div></div></header><div className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-24"><div className="mb-12 flex size-12 items-center justify-center bg-fixt-amber text-fixt-ink"><Check className="size-6" strokeWidth={1.5} /></div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-fixt-amber">Appointment confirmed</p><h1 className="mt-4 max-w-xl text-balance font-serif text-5xl leading-[0.98] tracking-[-0.055em] md:text-7xl">You&apos;re on the calendar.</h1><p className="mt-6 max-w-md text-sm leading-6 text-fixt-muted">A confirmation has been sent to {form.email}. We&apos;ll see you soon.</p><div className="mt-12 grid border-y border-fixt-line md:grid-cols-2"><div className="border-b border-fixt-line py-6 md:border-b-0 md:border-r md:pr-8"><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-fixt-muted">Appointment</p><p className="mt-3 font-serif text-2xl">{service.name}</p><p className="mt-1 font-mono text-xs text-fixt-muted">{getDateLabel(date)} · {slot}</p><p className="mt-1 text-sm text-fixt-muted">{service.duration} minutes · {business.timezoneLabel}</p></div><div className="py-6 md:pl-8"><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-fixt-muted">Booking reference</p><p className="mt-3 font-mono text-2xl tracking-[0.08em]">{reference}</p><button onClick={() => navigator.clipboard?.writeText(reference)} className="mt-3 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-fixt-muted hover:text-fixt-ink"><Copy className="size-3.5" strokeWidth={1.5} /> Copy reference</button></div></div><div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><a href={`mailto:${form.email}?subject=Cancel ${reference}`} className="font-mono text-[10px] uppercase tracking-[0.14em] text-fixt-muted underline decoration-fixt-amber underline-offset-4 hover:text-fixt-ink">Need to cancel? Email us</a><button onClick={onStartOver} className="inline-flex items-center justify-center gap-2 border border-fixt-line px-5 py-3 font-mono text-[10px] uppercase tracking-[0.14em] hover:border-fixt-ink">Book another appointment <ArrowRight className="size-4" strokeWidth={1.5} /></button></div><div className="mt-16 flex items-start gap-3 border-t border-fixt-line pt-5 text-xs leading-5 text-fixt-muted"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-fixt-amber" strokeWidth={1.5} /><p>Your information is only used to manage this appointment. No account required.</p></div></div></main>
}

function SectionLabel({ children }: { children: React.ReactNode }) { return <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.18em] text-fixt-muted">{children}</p> }
function Field({ label, value, onChange, required, type = 'text', hint }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string; hint?: string }) { return <label className="block"><span className="mb-2 flex justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-fixt-muted"><span>{label}{required && ' *'}</span>{hint && <span>{hint}</span>}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="w-full border-b border-fixt-line bg-transparent px-0 py-3 text-sm outline-none transition-colors placeholder:text-fixt-muted focus:border-fixt-amber" /></label> }
