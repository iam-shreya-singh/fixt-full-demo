export type Service = { id: string; name: string; description: string; duration: number; price: string }

export type Slot = { id: string; time: string }

export const business = {
  name: 'Morrow Studio',
  description: 'A considered space for restorative bodywork and thoughtful care.',
  timezone: 'America/Los_Angeles',
  timezoneLabel: 'Pacific Time',
  address: '118 Alder Street, Portland, OR',
}

export const services: Service[] = [
  { id: 'reset', name: 'The Reset', description: 'A focused session to release tension and return to center.', duration: 60, price: '$120' },
  { id: 'deep-work', name: 'Deep Work', description: 'Unhurried, full-body care for persistent knots and fatigue.', duration: 90, price: '$165' },
  { id: 'consultation', name: 'First Visit', description: 'A gentle introduction with time to talk through what you need.', duration: 45, price: '$85' },
]

export const dates = [
  { id: '2026-08-25', weekday: 'Tue', day: '25', month: 'Aug' },
  { id: '2026-08-26', weekday: 'Wed', day: '26', month: 'Aug' },
  { id: '2026-08-27', weekday: 'Thu', day: '27', month: 'Aug' },
  { id: '2026-08-28', weekday: 'Fri', day: '28', month: 'Aug' },
  { id: '2026-08-29', weekday: 'Sat', day: '29', month: 'Aug' },
]

export const availability: Record<string, Slot[]> = {
  '2026-08-25': [{ id: '0900', time: '9:00 AM' }, { id: '1030', time: '10:30 AM' }, { id: '1330', time: '1:30 PM' }, { id: '1600', time: '4:00 PM' }],
  '2026-08-26': [{ id: '1000', time: '10:00 AM' }, { id: '1130', time: '11:30 AM' }, { id: '1430', time: '2:30 PM' }],
  '2026-08-27': [],
  '2026-08-28': [{ id: '0900', time: '9:00 AM' }, { id: '1200', time: '12:00 PM' }, { id: '1500', time: '3:00 PM' }],
  '2026-08-29': [{ id: '1030', time: '10:30 AM' }, { id: '1300', time: '1:00 PM' }],
}

export function getDateLabel(id: string) {
  const date = dates.find((item) => item.id === id)
  return date ? `${date.weekday}, ${date.month} ${date.day}, 2026` : id
}

export function getSlot(id: string, date: string) {
  return availability[date]?.find((slot) => slot.id === id)
}

export function makeReference() {
  return 'FXT-' + Math.random().toString(36).slice(2, 8).toUpperCase()
}
