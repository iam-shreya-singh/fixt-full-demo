'use client'

import { useState } from 'react'
import { saveOwnerProfile, type OwnerProfile } from '@/app/actions/onboarding'

export function OwnerOnboardingForm({ initialProfile }: { initialProfile: OwnerProfile | null }) {
  const [businessName, setBusinessName] = useState(initialProfile?.businessName ?? '')
  const [slug, setSlug] = useState(initialProfile?.slug ?? '')
  const [timezone, setTimezone] = useState(initialProfile?.timezone ?? 'America/New_York')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(Boolean(initialProfile?.onboardingComplete))
  const [pending, setPending] = useState(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setPending(true); setError(''); setSaved(false)
    try { await saveOwnerProfile({ businessName, slug, timezone }); setSaved(true) } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not save your profile.') } finally { setPending(false) }
  }

  return <main className="mx-auto min-h-screen max-w-3xl bg-paper px-6 py-12 text-ink md:px-10"><p className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber">Fixt / owner setup</p><h1 className="mt-3 font-serif text-5xl">Make it bookable.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-ink/65">Set up the public details customers will see before choosing a time.</p><form onSubmit={submit} className="mt-10 space-y-6 border-y border-ink/15 py-8"><label className="block text-sm">Business name<input required value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="mt-2 block w-full border border-ink/20 bg-paper px-3 py-3 text-ink outline-none focus:border-amber" placeholder="Northline Studio" /></label><label className="block text-sm">Booking URL<input required value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-2 block w-full border border-ink/20 bg-paper px-3 py-3 font-mono text-sm text-ink outline-none focus:border-amber" placeholder="northline-studio" /><span className="mt-2 block text-xs text-ink/50">fixt.app/book/{slug || 'your-business'}</span></label><label className="block text-sm">Business timezone<select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="mt-2 block w-full border border-ink/20 bg-paper px-3 py-3 text-ink outline-none focus:border-amber"><option value="America/New_York">Eastern Time</option><option value="America/Chicago">Central Time</option><option value="America/Denver">Mountain Time</option><option value="America/Los_Angeles">Pacific Time</option></select></label>{error && <p role="alert" className="border border-red-900/20 bg-red-50 p-4 text-sm text-red-900">{error}</p>}{saved && <p role="status" className="border border-amber/30 bg-amber/10 p-4 text-sm">Your booking page details are saved.</p>}<button disabled={pending} className="border border-ink bg-ink px-5 py-3 text-sm text-paper disabled:opacity-50">{pending ? 'Saving…' : 'Save and continue'}</button></form></main>
}
