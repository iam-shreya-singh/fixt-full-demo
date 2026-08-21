'use client'

import { useState } from 'react'
import { updateOwnerAvailability, type OwnerAvailability } from '@/app/actions/availability'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function AvailabilityManager({ initialRows }: { initialRows: OwnerAvailability[] }) {
  const [rows, setRows] = useState(initialRows)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  function update(index: number, patch: Partial<OwnerAvailability>) {
    setSaved(false)
    setRows((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row))
  }

  async function save() {
    setPending(true)
    setError('')
    try {
      await updateOwnerAvailability(rows)
      setSaved(true)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save hours.')
    } finally {
      setPending(false)
    }
  }

  return <section className="space-y-6">
    <div className="flex items-end justify-between gap-4 border-b border-ink/15 pb-5">
      <div><p className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber">Owner / availability</p><h1 className="mt-2 font-serif text-4xl text-ink">Working hours</h1><p className="mt-2 max-w-xl text-sm leading-6 text-ink/65">Set the hours customers can book. Times are shown in your business timezone.</p></div>
      <button onClick={save} disabled={pending} className="border border-ink bg-ink px-5 py-3 text-sm font-medium text-paper transition-colors hover:bg-ink/90 disabled:cursor-wait disabled:opacity-60">{pending ? 'Saving…' : 'Save hours'}</button>
    </div>
    {error && <p role="alert" className="border border-red-900/20 bg-red-50 p-4 text-sm text-red-900">{error}</p>}
    {saved && <p role="status" className="border border-amber/30 bg-amber/10 p-4 text-sm text-ink">Hours saved. Your booking page will use these times.</p>}
    <div className="divide-y divide-ink/10 border-y border-ink/15">
      {rows.map((row, index) => <div key={row.id} className="flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
        <label className="flex items-center gap-3 text-sm text-ink"><input type="checkbox" checked={row.enabled} onChange={(event) => update(index, { enabled: event.target.checked })} className="h-4 w-4 accent-amber" /> <span className="w-28">{DAYS[row.weekday]}</span></label>
        <div className="flex items-center gap-3 font-mono text-sm"><input aria-label={`${DAYS[row.weekday]} start time`} type="time" value={row.startTime} disabled={!row.enabled} onChange={(event) => update(index, { startTime: event.target.value })} className="border border-ink/20 bg-paper px-3 py-2 text-ink disabled:opacity-40" /><span className="text-ink/40">to</span><input aria-label={`${DAYS[row.weekday]} end time`} type="time" value={row.endTime} disabled={!row.enabled} onChange={(event) => update(index, { endTime: event.target.value })} className="border border-ink/20 bg-paper px-3 py-2 text-ink disabled:opacity-40" /></div>
      </div>)}
    </div>
  </section>
}
