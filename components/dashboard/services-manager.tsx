'use client'

import { useState, useTransition } from 'react'
import { archiveService, createService, updateService, type OwnerService } from '@/app/actions/services'

type Props = { initialServices: OwnerService[] }
type FormState = { id?: string; name: string; description: string; durationMinutes: string; price: string }
const blank: FormState = { name: '', description: '', durationMinutes: '45', price: '' }

function money(cents: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100) }

export function ServicesManager({ initialServices }: Props) {
  const [items, setItems] = useState(initialServices)
  const [form, setForm] = useState<FormState>(blank)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const active = items.filter((item) => item.status === 'active')
  const archived = items.filter((item) => item.status === 'archived')

  function submit(event: React.FormEvent) {
    event.preventDefault(); setError('')
    const input = { name: form.name, description: form.description, durationMinutes: Number(form.durationMinutes), priceCents: Math.round(Number(form.price || 0) * 100) }
    startTransition(async () => {
      try {
        if (form.id) await updateService(form.id, input)
        else await createService(input)
        window.location.reload()
      } catch (err) { setError(err instanceof Error ? err.message : 'Unable to save service.') }
    })
  }

  function edit(item: OwnerService) {
    setEditing(true); setError(''); setForm({ id: item.id, name: item.name, description: item.description, durationMinutes: String(item.durationMinutes), price: (item.priceCents / 100).toFixed(2) })
  }

  function archive(id: string) {
    startTransition(async () => { await archiveService(id); setItems((current) => current.map((item) => item.id === id ? { ...item, status: 'archived' } : item)) })
  }

  return <main className="min-h-screen bg-background text-foreground"><div className="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-12">
    <header className="mb-10 flex flex-col gap-5 border-b border-border pb-7 md:flex-row md:items-end md:justify-between"><div><p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Owner / catalog</p><h1 className="mt-3 font-serif text-4xl tracking-tight md:text-5xl">Services</h1><p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Shape the appointments your clients can book. Keep the essentials clear, and let the details do the work.</p></div><button type="button" onClick={() => { setEditing(false); setError(''); setForm(blank) }} className="border border-foreground bg-foreground px-5 py-3 text-sm font-medium text-background transition-colors hover:bg-amber hover:text-foreground">Add service</button></header>
    <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
      <section aria-label="Service catalog" className="space-y-8"><div><div className="mb-3 flex items-baseline justify-between"><h2 className="font-serif text-2xl">Active services</h2><span className="font-mono text-xs text-muted-foreground">{active.length} listed</span></div>{active.length ? <div className="divide-y divide-border border-y border-border">{active.map((item) => <article key={item.id} className="flex flex-col gap-5 py-5 sm:flex-row sm:items-start sm:justify-between"><div><h3 className="font-serif text-xl">{item.name}</h3><p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">{item.description || 'No description added.'}</p><p className="mt-3 font-mono text-xs text-muted-foreground">{item.durationMinutes} min <span className="px-2 text-border">/</span> {money(item.priceCents)}</p></div><div className="flex shrink-0 gap-4 text-xs font-medium"><button type="button" className="underline underline-offset-4" onClick={() => edit(item)}>Edit</button><button type="button" className="text-muted-foreground underline underline-offset-4 hover:text-foreground" onClick={() => archive(item.id)}>Archive</button></div></article>)}</div> : <p className="border-y border-border py-8 text-sm text-muted-foreground">No active services yet.</p>}</div>
      <div><h2 className="mb-3 font-serif text-2xl">Archived</h2>{archived.length ? <div className="divide-y divide-border border-y border-border">{archived.map((item) => <div key={item.id} className="flex items-center justify-between py-4"><div><p className="font-serif text-lg text-muted-foreground">{item.name}</p><p className="font-mono text-[11px] text-muted-foreground">{item.durationMinutes} min / {money(item.priceCents)}</p></div><span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Archived</span></div>)}</div> : <p className="border-y border-border py-8 text-sm text-muted-foreground">Nothing archived.</p>}</div></section>
      <aside className="border border-border bg-card p-5 md:p-6"><p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{editing ? 'Edit service' : 'New service'}</p><form className="mt-6 space-y-5" onSubmit={submit}><label className="block text-sm">Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-2 w-full border border-border bg-background px-3 py-3 text-sm outline-none focus:border-foreground" /></label><label className="block text-sm">Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="mt-2 w-full resize-none border border-border bg-background px-3 py-3 text-sm leading-6 outline-none focus:border-foreground" /></label><div className="grid grid-cols-2 gap-3"><label className="block text-sm">Minutes<input required type="number" min="15" max="480" step="15" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} className="mt-2 w-full border border-border bg-background px-3 py-3 font-mono text-sm outline-none focus:border-foreground" /></label><label className="block text-sm">Price<input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="mt-2 w-full border border-border bg-background px-3 py-3 font-mono text-sm outline-none focus:border-foreground" /></label></div>{error && <p role="alert" className="border border-destructive/40 p-3 text-xs leading-5 text-destructive">{error}</p>}<button disabled={isPending} className="w-full border border-foreground bg-foreground px-4 py-3 text-sm font-medium text-background transition-colors hover:bg-amber hover:text-foreground disabled:cursor-wait disabled:opacity-60">{isPending ? 'Saving...' : editing ? 'Save changes' : 'Create service'}</button>{editing && <button type="button" onClick={() => { setEditing(false); setForm(blank); setError('') }} className="w-full px-4 py-2 text-xs text-muted-foreground underline underline-offset-4">Cancel editing</button>}</form></aside>
    </div>
  </div></main>
}
