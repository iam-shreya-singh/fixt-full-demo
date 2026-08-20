'use client'

import { useEffect, useState } from 'react'
import type { DashboardAppointment } from '@/app/actions/dashboard'
import { getOwnerDashboard } from '@/app/actions/dashboard'

const ink = 'text-[#1E293B]'
const mono = 'font-mono text-xs tracking-[0.08em]'

function formatTime(value: string) {
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(value))
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date(value))
}

export function OwnerOverview() {
  const [appointments, setAppointments] = useState<DashboardAppointment[]>([])
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    getOwnerDashboard().then((data) => { setAppointments(data); setState('ready') }).catch(() => setState('error'))
  }, [])

  const today = appointments.filter((appointment) => new Date(appointment.startsAt).toDateString() === new Date().toDateString())
  const upcoming = appointments.filter((appointment) => new Date(appointment.startsAt).toDateString() !== new Date().toDateString())

  return <main className="min-h-screen bg-[#F7F4EC] px-5 py-6 md:px-10 md:py-8">
    <div className="mx-auto max-w-6xl">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-[#CBD1D7] pb-6">
        <div><p className={`${mono} mb-3 uppercase text-[#B87924]`}>Fixt / Owner workspace</p><h1 className={`font-serif text-5xl leading-none ${ink}`}>Good morning, Alex.</h1><p className="mt-4 text-sm leading-6 text-[#64748B]">Here&apos;s the shape of your day.</p></div>
        <div className="text-right"><p className={`${mono} uppercase text-[#64748B]`}>Thursday, August 20</p><button className="mt-3 border border-[#1E293B] bg-[#1E293B] px-4 py-2 text-sm text-[#F7F4EC] transition hover:bg-[#B87924]">View public booking page</button></div>
      </header>

      <section aria-label="Summary" className="grid border-y border-[#CBD1D7] md:grid-cols-3">
        {[['Today', today.length.toString().padStart(2, '0'), 'appointments'], ['Upcoming', upcoming.length.toString().padStart(2, '0'), 'next 7 days'], ['Open capacity', '04', 'slots remaining']].map(([label, value, detail]) => <div key={label} className="border-b border-[#CBD1D7] px-5 py-5 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0"><p className={`${mono} uppercase text-[#64748B]`}>{label}</p><p className={`mt-3 font-serif text-4xl ${ink}`}>{value}</p><p className="mt-1 text-sm text-[#64748B]">{detail}</p></div>)}
      </section>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.35fr_1fr]">
        <section><div className="mb-4 flex items-center justify-between"><h2 className={`font-serif text-3xl ${ink}`}>Today&apos;s appointments</h2><span className={`${mono} text-[#64748B]`}>{today.length} total</span></div>
          <div className="border-t border-[#CBD1D7]">{state === 'loading' && <p className="py-8 text-sm text-[#64748B]">Loading your appointments...</p>}{state === 'error' && <p className="py-8 text-sm text-[#9B3B2E]">We couldn&apos;t load your appointments. Refresh to try again.</p>}{state === 'ready' && today.length === 0 && <p className="py-8 text-sm text-[#64748B]">Nothing scheduled today. Your calendar is clear.</p>}{today.map((appointment) => <article key={appointment.id} className="flex items-start justify-between gap-4 border-b border-[#CBD1D7] py-5"><div className="flex gap-4"><time className={`${mono} w-20 shrink-0 pt-1 text-[#B87924]`}>{formatTime(appointment.startsAt)}</time><div><h3 className={`text-base font-medium ${ink}`}>{appointment.customerName}</h3><p className="mt-1 text-sm text-[#64748B]">{appointment.serviceName}</p></div></div><span className={`${mono} border border-[#AFC8B4] px-2 py-1 text-[#3D7049]`}>confirmed</span></article>)}</div>
        </section>
        <aside><div className="mb-4 flex items-center justify-between"><h2 className={`font-serif text-3xl ${ink}`}>Coming up</h2><span className={`${mono} text-[#64748B]`}>7 days</span></div><div className="border-t border-[#CBD1D7]">{upcoming.map((appointment) => <article key={appointment.id} className="border-b border-[#CBD1D7] py-5"><div className="flex justify-between gap-4"><p className={`${mono} text-[#B87924]`}>{formatDate(appointment.startsAt)}</p><p className={`${mono} text-[#64748B]`}>{formatTime(appointment.startsAt)}</p></div><h3 className={`mt-3 text-base font-medium ${ink}`}>{appointment.customerName}</h3><p className="mt-1 text-sm text-[#64748B]">{appointment.serviceName}</p></article>)}{state === 'ready' && upcoming.length === 0 && <p className="py-8 text-sm text-[#64748B]">No upcoming appointments.</p>}</div></aside>
      </div>
    </div>
  </main>
}
