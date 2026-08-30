'use client'

import Link from 'next/link'
import { useState } from 'react'
import { landingFaqs } from '@/lib/landing-faqs'

export function FixtLandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <main className="min-h-screen overflow-hidden bg-fixt-paper text-fixt-ink">
      <header className="border-b border-fixt-line">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
          <Link href="/" className="font-serif text-2xl tracking-[-0.04em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fixt-amber">Fixt<span className="text-fixt-amber">.</span></Link>
          <nav aria-label="Primary navigation" className="hidden items-center gap-8 text-sm md:flex">
            <a href="#how-it-works" className="transition-colors hover:text-fixt-amber focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fixt-amber">How it works</a>
            <a href="#features" className="transition-colors hover:text-fixt-amber focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fixt-amber">Features</a>
            <a href="#faq" className="transition-colors hover:text-fixt-amber focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fixt-amber">FAQ</a>
          </nav>
          
          <Link href="/onboarding" className="border border-fixt-ink bg-fixt-ink px-4 py-2.5 text-xs font-medium text-fixt-paper transition-colors hover:bg-fixt-amber hover:text-fixt-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fixt-amber">Start with Fixt</Link>
        </div>
      </header>

      <section className="border-b border-fixt-line px-5 py-20 md:px-8 md:py-32">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[1.05fr_.95fr] lg:items-end">
          <div>
            <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.18em] text-fixt-muted">Appointment booking software for service businesses</p>
            <h1 className="max-w-4xl font-serif text-5xl leading-[0.98] tracking-[-0.055em] text-balance md:text-7xl lg:text-8xl">Make time for the work that matters.</h1>
            <p className="mt-8 max-w-xl text-base leading-7 text-fixt-muted md:text-lg">Fixt gives independent providers a clear online booking system for services, schedules, clients, and the appointments that keep business moving.</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/onboarding" className="inline-flex items-center justify-center border border-fixt-amber bg-fixt-amber px-6 py-3.5 text-sm font-medium text-fixt-ink transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fixt-ink">Create your booking page <span aria-hidden="true" className="ml-3">→</span></Link>
              <Link href="/demo" className="inline-flex items-center justify-center border border-fixt-line px-6 py-3.5 text-sm font-medium transition-colors hover:border-fixt-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fixt-amber">See a live example</Link>
            </div>
          </div>
          <div className="border border-fixt-ink bg-fixt-wash p-4 md:p-6">
            <div className="border border-fixt-line bg-fixt-paper">
              <div className="flex items-center justify-between border-b border-fixt-line px-4 py-3"><span className="font-serif text-lg">Morrow Studio</span><span className="font-mono text-[10px] uppercase tracking-widest text-fixt-muted">Public booking</span></div>
              <div className="grid gap-6 p-5 md:grid-cols-[.8fr_1fr] md:p-7">
                <div><p className="font-mono text-[10px] uppercase tracking-widest text-fixt-muted">Choose a service</p><p className="mt-5 border border-fixt-amber bg-fixt-amber/10 p-4 text-sm font-medium">Initial consultation <span className="mt-1 block font-mono text-[11px] font-normal text-fixt-muted">45 min · $95</span></p><p className="mt-3 border border-fixt-line p-4 text-sm">Follow-up session <span className="mt-1 block font-mono text-[11px] text-fixt-muted">45 min · $75</span></p></div>
                <div><p className="font-mono text-[10px] uppercase tracking-widest text-fixt-muted">Available this week</p><div className="mt-5 grid grid-cols-3 gap-2">{['Tue 14','Wed 15','Thu 16','Fri 17','Mon 20','Tue 21'].map((day, index) => <div key={day} className={`border p-3 text-center font-mono text-[10px] ${index === 1 ? 'border-fixt-ink bg-fixt-ink text-fixt-paper' : 'border-fixt-line'}`}>{day}<span className="mt-1 block font-sans text-xs">{index === 1 ? '10:00' : '09:30'}</span></div>)}</div><p className="mt-6 border-t border-fixt-line pt-4 font-mono text-[10px] uppercase tracking-wider text-fixt-muted">Timezone · America/New_York</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-fixt-line bg-fixt-ink px-5 py-8 text-fixt-paper md:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between"><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-fixt-amber">Built for the way service businesses actually work</p><p className="max-w-xl text-sm leading-6 text-fixt-paper/70">Less back-and-forth. Fewer missed details. A booking experience that feels like your business.</p></div></section>

      <section id="how-it-works" className="border-b border-fixt-line px-5 py-20 md:px-8 md:py-28"><div className="mx-auto max-w-7xl"><div className="grid gap-10 md:grid-cols-[.8fr_1.2fr]"><div><p className="font-mono text-[11px] uppercase tracking-[0.18em] text-fixt-muted">How it works</p><h2 className="mt-5 max-w-md font-serif text-4xl leading-tight tracking-[-0.04em] md:text-5xl">A calmer way to schedule client time.</h2></div><div className="grid border-t border-fixt-line md:grid-cols-3 md:border-l md:border-t-0">{[['01','Set your services','Add what you offer, how long it takes, and what clients need to know.'],['02','Open your availability','Control working hours with a schedule that reflects real life.'],['03','Let clients book','Share one clear booking page and keep every confirmation in view.']].map(([num,title,copy]) => <div key={num} className="border-b border-fixt-line py-6 md:border-b-0 md:border-r md:px-6 md:py-0"><span className="font-mono text-xs text-fixt-amber">{num}</span><h3 className="mt-10 font-serif text-2xl tracking-[-0.03em]">{title}</h3><p className="mt-3 text-sm leading-6 text-fixt-muted">{copy}</p></div>)}</div></div></div></section>

      <section id="features" className="border-b border-fixt-line px-5 py-20 md:px-8 md:py-28"><div className="mx-auto max-w-7xl"><div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="font-mono text-[11px] uppercase tracking-[0.18em] text-fixt-muted">The essentials, considered</p><h2 className="mt-5 max-w-2xl font-serif text-4xl leading-tight tracking-[-0.04em] md:text-6xl">Everything clients need. Nothing they have to learn.</h2></div><Link href="/dashboard" className="text-sm underline decoration-fixt-amber underline-offset-4 hover:text-fixt-amber focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fixt-amber">Explore the owner workspace →</Link></div><div className="mt-14 grid border-l border-t border-fixt-line md:grid-cols-2 lg:grid-cols-3">{[['Online booking','Give clients a polished booking page they can use on any device.'],['Availability management','Set working hours and keep your open slots aligned with the way you work.'],['Service catalog','Present your services, durations, and prices clearly before a client chooses a time.'],['Appointment overview','See today, upcoming, and past bookings without digging through messages.'],['Cancellation handling','Give clients a clear path to cancel and keep appointment status up to date.'],['Owner control','Manage services, customers, availability, and bookings from one focused workspace.']].map(([title,copy]) => <article key={title} className="border-b border-r border-fixt-line p-6 md:p-8"><div className="mb-12 h-2 w-2 bg-fixt-amber"/><h3 className="font-serif text-2xl tracking-[-0.03em]">{title}</h3><p className="mt-3 text-sm leading-6 text-fixt-muted">{copy}</p></article>)}</div></div></section>

      <section className="border-b border-fixt-line px-5 py-20 md:px-8 md:py-28"><div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1fr]"><div className="bg-fixt-amber p-7 md:p-10"><p className="font-mono text-[11px] uppercase tracking-[0.18em] text-fixt-ink/70">For independent providers</p><h2 className="mt-16 max-w-lg font-serif text-4xl leading-tight tracking-[-0.04em] md:text-5xl">Your booking system should feel like an extension of your practice.</h2><p className="mt-6 max-w-md text-sm leading-6 text-fixt-ink/75">Fixt keeps the operational layer quiet, so your clients experience confidence from the first click.</p></div><div className="flex flex-col justify-between border-t border-fixt-line pt-6 lg:border-t-0 lg:border-l lg:pl-10 lg:pt-0"><div><p className="font-mono text-[11px] uppercase tracking-[0.18em] text-fixt-muted">Designed for clarity</p><p className="mt-6 max-w-lg font-serif text-3xl leading-tight tracking-[-0.03em]">No marketplace noise. No complicated setup maze. Just the tools you need to take control of your time.</p></div><div className="mt-12 grid grid-cols-2 gap-6 border-t border-fixt-line pt-6"><div><span className="font-mono text-2xl">01</span><p className="mt-2 text-sm text-fixt-muted">One shareable booking page</p></div><div><span className="font-mono text-2xl">02</span><p className="mt-2 text-sm text-fixt-muted">One source of truth for appointments</p></div></div></div></div></section>

      <section id="faq" className="border-b border-fixt-line px-5 py-20 md:px-8 md:py-28"><div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[.7fr_1.3fr]"><div><p className="font-mono text-[11px] uppercase tracking-[0.18em] text-fixt-muted">FAQ</p><h2 className="mt-5 font-serif text-4xl tracking-[-0.04em] md:text-5xl">Good questions belong here.</h2></div><div>{landingFaqs.map(({ question, answer }, index) => <div key={question} className="border-t border-fixt-line"><button type="button" aria-expanded={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? null : index)} className="flex w-full items-center justify-between gap-6 py-5 text-left text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fixt-amber"><span>{question}</span><span className="font-mono text-lg text-fixt-amber">{openFaq === index ? '−' : '+'}</span></button>{openFaq === index && <p className="max-w-2xl pb-5 text-sm leading-6 text-fixt-muted">{answer}</p>}</div>)}</div></div></section>

      <section className="px-5 py-24 md:px-8 md:py-36"><div className="mx-auto max-w-4xl text-center"><p className="font-mono text-[11px] uppercase tracking-[0.18em] text-fixt-muted">Make room for better work</p><h2 className="mt-6 font-serif text-5xl leading-[0.98] tracking-[-0.055em] text-balance md:text-7xl">Start with a booking page your clients can trust.</h2><p className="mx-auto mt-7 max-w-xl text-base leading-7 text-fixt-muted">Build your service catalog, set your availability, and share a simpler way to book appointments online.</p><Link href="/onboarding" className="mt-9 inline-flex border border-fixt-ink bg-fixt-ink px-7 py-4 text-sm font-medium text-fixt-paper transition-colors hover:bg-fixt-amber hover:text-fixt-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fixt-amber">Start with Fixt <span aria-hidden="true" className="ml-3">→</span></Link></div></section>

      <footer className="border-t border-fixt-line px-5 py-7 md:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-5 text-xs text-fixt-muted md:flex-row md:items-center md:justify-between"><span className="font-serif text-xl text-fixt-ink">Fixt<span className="text-fixt-amber">.</span></span><div className="flex flex-wrap gap-5"><Link href="/demo" className="hover:text-fixt-ink">Booking demo</Link><Link href="/onboarding" className="hover:text-fixt-ink">Owner onboarding</Link><Link href="/dashboard" className="hover:text-fixt-ink">Owner workspace</Link></div><span className="font-mono text-[10px] uppercase tracking-wider">© 2026 Fixt</span></div></footer>
    </main>
  )
}


